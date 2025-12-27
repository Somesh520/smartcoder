import React, { useEffect, useState, useRef } from 'react';
import Workspace from './Workspace';
import { Users, Trophy, MessageSquare, Mic, MicOff, Send, Phone, PhoneIncoming, PhoneOff, Sword } from 'lucide-react';
import LoadingScreen from './LoadingScreen';


const Modal = ({ title, children, actions }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: '#18181b', border: '1px solid #333', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: 'white' }}>{title}</h2>
            <div style={{ color: '#a1a1aa', margin: '15px 0' }}>{children}</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '25px' }}>{actions}</div>
        </div>
    </div>
);

const CompetitionRoom = ({ socket, roomId, username, roomState, onBack }) => {
    // State declarations (must come before any conditional returns)
    const [problem, setProblem] = useState(null);
    const [winnerModal, setWinnerModal] = useState(null);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");

    // Voice State
    const [isMicOn, setIsMicOn] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    // Opponent State
    const [opponentStatus, setOpponentStatus] = useState('offline'); // 'online' | 'offline'

    // Toast State
    const [toast, setToast] = useState(null); // { message, type: 'info' | 'error' }

    // Volume Visualization State
    const [localVolume, setLocalVolume] = useState(0);
    const [remoteVolume, setRemoteVolume] = useState(0);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyzersRef = useRef({ local: null, remote: null });

    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null); // Persistent Audio Ref
    const peersRef = useRef({});
    const candidateQueueRef = useRef({});

    // Refs for Socket Handlers (to avoid stale closures without re-binding)
    const isCallingRef = useRef(false);
    const roomStateRef = useRef(roomState);

    // Sync Refs
    useEffect(() => { roomStateRef.current = roomState; }, [roomState]);
    useEffect(() => { isCallingRef.current = isCalling; }, [isCalling]);

    // Load Problem & Check Winner
    useEffect(() => {
        if (roomState?.problem) setProblem(roomState.problem);

        // DEBUG LOGGING
        // console.log("Current Room Status:", roomState?.status, "Winner:", roomState?.winner);

        // If rejoining a finished room, show winner
        if (roomState?.status === 'finished' && roomState?.winner) {
            console.log("🏆 GAME FINISHED! Winner is:", roomState.winner);
            setWinnerModal(roomState.winner);
        }
    }, [roomState]);

    // --- SYNC MESSAGES FROM SERVER (REJOIN HISTORY) ---
    useEffect(() => {
        if (roomState?.messages) {
            // Merging logic or simple replace? Simple replace is safer for rejoin.
            // We only want to do this if our local messages are empty (fresh load) or simple replace.
            setMessages(roomState.messages);
        }
    }, [roomState]);

    // --- TOAST HELPER ---
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- SOCKET HANDLERS ---
    useEffect(() => {
        const handlePlayerLeft = ({ winner }) => {
            if (winner === username) setWinnerModal(winner);

            // If they left, the call definitely ended.
            // Force cleanup and notify if we were in a call or just strictly show it.
            if (opponentStatus === 'online' || isMicOn) {
                setOpponentStatus('offline'); // FIXED: Ensure UI updates to "Call" not "Join"
                endCall(false); // Don't emit 'offline' back, they are gone.
                showToast("Opponent left the match (Call Ended)", 'info');
            }
        };

        const handleChat = (msg) => {
            setMessages(prev => [...prev, msg]);
        };

        const handleIncomingCall = (data) => {
            if (data.from === socket.id) return;
            console.log("☎️ INCOMING CALL RECEIVED!", data);
            if (!isMicOn) {
                setIncomingCall(true);
                const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
                audio.play().catch(e => { });
            }
        };

        const handleVoiceStatus = ({ status, userId }) => {
            if (userId === socket.id) return;

            console.log("Voice Status Update:", status);
            setOpponentStatus(status);

            if (status === 'online') {
                if (isCallingRef.current) {
                    console.log("🚀 Opponent Answered! Auto-connecting...");
                    setIsCalling(false);
                    startCall();
                } else {
                    setIsCalling(false);
                }
            }

            if (status === 'offline') {
                if (isMicOn) {
                    endCall(true); // EMIT BACK: Confirm we are also dropping, so initiator updates UI

                    // Lookup username (only notify if we were actually in a call)
                    const quitter = roomStateRef.current?.users?.find(u => u.id === userId);
                    const name = quitter ? quitter.username : "Opponent";

                    showToast(`📞 ${name} ended the call`, 'info');
                    setMessages(prev => [...prev, { username: "System", message: `📞 ${name} ended the call` }]);
                }
            }
        };

        const handleSignal = async ({ signal, senderId }) => {
            if (senderId === socket.id) return;
            // console.log("Received Signal:", signal.type); 

            const flushCandidateQueue = async (peer) => {
                if (candidateQueueRef.current[senderId]) {
                    console.log(`[ICE] Flushing ${candidateQueueRef.current[senderId].length} candidates for ${senderId}`);
                    for (const candidate of candidateQueueRef.current[senderId]) {
                        try {
                            await peer.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) { console.warn("[ICE] Flush Error", e); }
                    }
                    delete candidateQueueRef.current[senderId];
                }
            };

            if (signal.type === 'offer') {
                if (peersRef.current[senderId]) {
                    peersRef.current[senderId].close();
                    delete peersRef.current[senderId];
                }
                const newPeer = createPeer(senderId, localStreamRef.current, false);
                await newPeer.setRemoteDescription(new RTCSessionDescription(signal));
                await flushCandidateQueue(newPeer);

                const answer = await newPeer.createAnswer();
                await newPeer.setLocalDescription(answer);
                socket.emit('voiceSignal', { roomId, signal: newPeer.localDescription, targetId: senderId });

            } else if (signal.type === 'answer') {
                const peer = peersRef.current[senderId];
                if (peer) {
                    await peer.setRemoteDescription(new RTCSessionDescription(signal));
                    await flushCandidateQueue(peer);
                }

            } else if (signal.candidate) {
                const peer = peersRef.current[senderId];
                if (peer) {
                    if (peer.remoteDescription && peer.remoteDescription.type) {
                        try {
                            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
                        } catch (e) { console.warn("ICE Error", e); }
                    } else {
                        // Queue early candidates
                        console.log(`[ICE] Queuing candidate for ${senderId} (Remote Description not set)`);
                        if (!candidateQueueRef.current[senderId]) candidateQueueRef.current[senderId] = [];
                        candidateQueueRef.current[senderId].push(signal.candidate);
                    }
                }
            }
        };
        const handleCallRejected = ({ username }) => {
            setIsCalling(false); // Stop calling state
            showToast(`Called Ignored by ${username}`, 'error');
        };

        socket.on('playerLeft', handlePlayerLeft);
        socket.on('chatMessage', handleChat);
        socket.on('voiceSignal', handleSignal);
        socket.on('incomingCall', handleIncomingCall);
        socket.on('voiceStatus', handleVoiceStatus);
        socket.on('callRejected', handleCallRejected);

        return () => {
            socket.off('playerLeft', handlePlayerLeft);
            socket.off('chatMessage', handleChat);
            socket.off('voiceSignal', handleSignal);
            socket.off('incomingCall', handleIncomingCall);
            socket.off('voiceStatus', handleVoiceStatus);
            socket.off('callRejected', handleCallRejected);
        };
    }, [socket, username, roomId, isMicOn]);

    // ... (rest of component)



    // ... (inside Return)

    {/* TOAST NOTIFICATION */ }
    {
        toast && (
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#18181b',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: toast.type === 'error' ? '1px solid #ef4444' : '1px solid #22c55e',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideDown 0.3s ease-out'
            }}>
                {toast.type === 'error' ? <MicOff size={18} color="#ef4444" /> : <PhoneOff size={18} color="#22c55e" />}
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{toast.message}</span>
            </div>
        )
    }
    <style>{`@keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>

    {/* SIDEBAR */ }

    // --- RE-BROADCAST STATUS ON ROOM UPDATE (For new joiners) ---
    useEffect(() => {
        // If I am Live, and the room updates (someone joined?), tell them I am here.
        if (isMicOn) {
            // Small delay to ensure they are ready to receive
            const t = setTimeout(() => {
                socket.emit('voiceStatus', { roomId, status: 'online' });
            }, 1000);
            return () => clearTimeout(t);
        }
    }, [roomState, isMicOn, roomId, socket]);

    // --- AUDIO VISUALIZATION ---
    useEffect(() => {
        const analyze = () => {
            if (analyzersRef.current.local) {
                const data = new Uint8Array(analyzersRef.current.local.frequencyBinCount);
                analyzersRef.current.local.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b, 0) / data.length;
                setLocalVolume(avg);
            }
            if (analyzersRef.current.remote) {
                const data = new Uint8Array(analyzersRef.current.remote.frequencyBinCount);
                analyzersRef.current.remote.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b, 0) / data.length;
                setRemoteVolume(avg);
            }
            animationRef.current = requestAnimationFrame(analyze);
        };
        animationRef.current = requestAnimationFrame(analyze);
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    const setupAudioAnalysis = (stream, type) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyzer = audioContextRef.current.createAnalyser();
        analyzer.fftSize = 32;
        source.connect(analyzer);
        analyzersRef.current[type] = analyzer;
    };

    // --- MEDIA LOGIC (Cleanup) ---

    // --- MEDIA LOGIC (Cleanup) ---
    // --- MEDIA LOGIC (Cleanup) ---
    useEffect(() => {
        return () => {
            try {
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => track.stop());
                }
                Object.values(peersRef.current).forEach(p => p.close());
            } catch (e) {
                console.warn("Cleanup Error:", e);
            }
        };
    }, []);

    const endCall = (notify = true) => {
        setIsMicOn(false);
        if (notify) socket.emit('voiceStatus', { roomId, status: 'offline' });

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        Object.values(peersRef.current).forEach(p => p.close());
        peersRef.current = {};
        setIsCalling(false);
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;

            // ANALYZE LOCAL AUDIO
            setupAudioAnalysis(stream, 'local');

            setIsMicOn(true);
            setIncomingCall(false);
            socket.emit('voiceStatus', { roomId, status: 'online' });

            // Connect to opponent(s)
            roomStateRef.current?.users?.forEach(u => {
                if (u.id !== socket.id) {
                    if (peersRef.current[u.id]) {
                        peersRef.current[u.id].close();
                        delete peersRef.current[u.id];
                    }
                    createPeer(u.id, stream, true);
                }
            });

        } catch (e) {
            console.error("Mic Error:", e);
            alert("Could not access Microphone: " + e.message);
        }
    };

    // Toggle Voice Only
    const toggleMic = async () => {
        if (isMicOn) {
            endCall(true);
            showToast("You ended the call", 'info');
            setMessages(prev => [...prev, { username: "System", message: "📞 You ended the call" }]);
        } else {
            startCall();
        }
    };

    const requestCall = () => {
        if (isMicOn) return;
        console.log("📞 SENDING CALL REQUEST to Room:", roomId);
        setIsCalling(true);
        socket.emit('callUser', { roomId });
        setTimeout(() => setIsCalling(false), 5000);
    };

    const createPeer = (targetId, stream, initiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        peersRef.current[targetId] = peer;

        if (stream) {
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voiceSignal', { roomId, signal: { candidate: event.candidate }, targetId });
            }
        };

        peer.ontrack = (event) => {
            console.log("Remote Audio Received - Playing");
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
                remoteAudioRef.current.play().catch(e => console.error("Audio Play Error:", e));

                // ANALYZE REMOTE AUDIO
                setupAudioAnalysis(event.streams[0], 'remote');
            }
        };

        // Debug Connection State
        peer.onconnectionstatechange = () => {
            console.log("Peer Connection State:", peer.connectionState);
        };
        peer.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", peer.iceConnectionState);
        };

        if (initiator) {
            peer.createOffer().then(offer => {
                peer.setLocalDescription(offer);
                socket.emit('voiceSignal', { roomId, signal: offer, targetId });
            });
        }

        return peer;
    };

    const sendChat = () => {
        if (!chatInput.trim()) return;
        socket.emit('chatMessage', { roomId, message: chatInput, username });
        setChatInput("");
    };




    // Guard against null roomState (must be after all hooks)
    if (!roomState) return <LoadingScreen text="SYNCHRONIZING BATTLEFIELD..." />;

    // Helper to determine if we should show the VS/Waiting Overlay
    const showOverlay = roomState.status === 'waiting' || roomState.status === 'starting';

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', background: '#09090b' }}>

            {/* INVISIBLE AUDIO ELEMENT FOR REMOTE STREAM (Keep this always mounted) */}
            <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

            {/* WAITING / VS OVERLAY (Absolute Positioned) */}
            {showOverlay && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 50, background: '#09090b',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.5s ease-out',
                    // If we are starting, we want this to stay visible until the very end, effectively covering the loading workspace
                }}>
                    {(() => {
                        const userCount = roomState.users.length;
                        const opponent = roomState.users.find(u => u.username !== username);
                        const isStarting = roomState.status === 'starting' || userCount === 2;

                        const copyLink = () => {
                            const url = `${window.location.origin}?room=${roomId}`;
                            navigator.clipboard.writeText(url);
                            showToast("Invite Link Copied!", 'info');
                        };

                        return (
                            <>
                                {/* Background Grid & Glow */}
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle at center, #1e293b 0%, #000 100%)' }} />
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#1f1f23 1px, transparent 1px), linear-gradient(90deg, #1f1f23 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }} />

                                {/* VS Badge */}
                                <div style={{
                                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                                    zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%', background: '#000',
                                        border: '4px solid #f59e0b', boxShadow: '0 0 30px #f59e0b',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '32px', fontWeight: 900, color: '#f59e0b', fontStyle: 'italic',
                                        animation: isStarting ? 'pulse-fast 0.5s infinite' : 'none'
                                    }}>
                                        VS
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div style={{ display: 'flex', width: '100%', maxWidth: '1000px', height: '400px', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, padding: '0 40px' }}>

                                    {/* PLAYER 1 (YOU) */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideInLeft 0.5s ease-out' }}>
                                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)', marginBottom: '24px', border: '4px solid #fff' }}>
                                            <Users size={60} color="white" />
                                        </div>
                                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{username}</h2>
                                        <div style={{ padding: '6px 16px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderRadius: '20px', fontSize: '14px', fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.3)' }}>READY</div>
                                    </div>

                                    {/* PLAYER 2 */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideInRight 0.5s ease-out' }}>
                                        {opponent ? (
                                            <>
                                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)', marginBottom: '24px', border: '4px solid #fff' }}>
                                                    <Sword size={60} color="white" />
                                                </div>
                                                <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{opponent.username}</h2>
                                                <div style={{ padding: '6px 16px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '20px', fontSize: '14px', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>CONNECTED</div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px dashed #52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'spin-slow 10s linear infinite' }}>
                                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.1, background: 'white' }}></div>
                                                </div>
                                                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#71717a', marginBottom: '8px', fontStyle: 'italic' }}>Searching...</h2>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ zIndex: 10, marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                    {isStarting ? (
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24', animation: 'pulse 1s infinite' }}>
                                            BATTLE STARTING IN 3...
                                        </div>
                                    ) : (
                                        <div style={{ background: '#18181b', padding: '16px 24px', borderRadius: '16px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                                            <div style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: 500 }}>INVITE A FRIEND</div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{ background: '#27272a', padding: '10px 16px', borderRadius: '8px', fontFamily: 'monospace', color: 'white', letterSpacing: '1px', border: '1px solid #3f3f46' }}>{roomId}</div>
                                                <button onClick={copyLink} style={{ background: '#2563eb', border: 'none', borderRadius: '8px', padding: '0 20px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Users size={16} /> COPY
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <style>{`
                                     @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
                                     @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
                                     @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                                     @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                                     @keyframes pulse-fast { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
                                 `}</style>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* MAIN GAME UI (Mounted Underneath) */}
            {problem ? (
                <div style={{
                    display: 'flex', height: '100%',
                    // This is the key: We keep it mounted, but maybe hidden or z-index lower.
                    // Actually, let's keep it visible but covered by the absolute overlay above.
                    // This ensures it renders/fetches.
                }}>

                    {/* MODALS */}

                    {/* PREMIUM RESULT SCREEN OVERLAY */}
                    {winnerModal && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 2000,
                            background: 'rgba(9, 9, 11, 0.95)',
                            backdropFilter: 'blur(15px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            animation: 'fadeIn 0.5s ease-out'
                        }}>
                            {/* Confetti / Particle Effects could go here */}

                            <div style={{
                                fontSize: '80px', fontWeight: 900,
                                background: winnerModal === username ? 'linear-gradient(to bottom, #4ade80, #22c55e)' : 'linear-gradient(to bottom, #f87171, #ef4444)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                textShadow: winnerModal === username ? '0 0 50px rgba(34, 197, 94, 0.5)' : '0 0 50px rgba(239, 68, 68, 0.5)',
                                marginBottom: '20px',
                                letterSpacing: '-2px',
                                animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {winnerModal === username ? "VICTORY" : "DEFEAT"}
                            </div>

                            <div style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '60px', fontWeight: 500 }}>
                                {winnerModal === username ? "You solved it first! 🚀" : `${winnerModal} claimed the victory.`}
                            </div>

                            {/* RESULTS TABLE */}
                            <div style={{
                                width: '100%', maxWidth: '600px',
                                background: '#18181b', borderRadius: '24px',
                                border: '1px solid #27272a',
                                padding: '30px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                {roomState.users.sort((a, b) => (a.timeTaken || Infinity) - (b.timeTaken || Infinity)).map((u, i) => {
                                    const isWinner = u.username === winnerModal;
                                    const formatTime = (ms) => {
                                        if (!ms) return "--:--";
                                        const mins = Math.floor(ms / 60000);
                                        const secs = Math.floor((ms % 60000) / 1000);
                                        return `${mins}m ${secs}s`;
                                    };

                                    return (
                                        <div key={u.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '20px', marginBottom: '10px',
                                            background: isWinner ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                            borderRadius: '16px',
                                            border: isWinner ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{
                                                    width: '50px', height: '50px', borderRadius: '50%',
                                                    background: isWinner ? '#22c55e' : '#3f3f46',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '24px', fontWeight: 700, color: 'white'
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
                                                        {u.username} {u.username === username && <span style={{ fontSize: '12px', color: '#71717a' }}>(You)</span>}
                                                    </span>
                                                    <span style={{ fontSize: '14px', color: isWinner ? '#4ade80' : '#71717a' }}>
                                                        {isWinner ? "Winner" : (u.status === 'completed' ? "Finished" : "DNF")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>
                                                    {u.timeTaken ? formatTime(u.timeTaken) : "--:--"}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#71717a' }}>Time Taken</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={onBack}
                                style={{
                                    marginTop: '60px',
                                    background: 'white', color: 'black',
                                    padding: '16px 40px', borderRadius: '100px',
                                    fontSize: '18px', fontWeight: 700,
                                    border: 'none', cursor: 'pointer',
                                    boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            >
                                Return to Lobby
                            </button>

                            <style>{`
                                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                                @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                            `}</style>
                        </div>
                    )}

                    {showLeaveConfirm && (
                        <Modal title="Leave Battle?" actions={
                            <>
                                <button onClick={() => setShowLeaveConfirm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={() => { setShowLeaveConfirm(false); onBack(); }} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Yes, Surrender</button>
                            </>
                        }>
                            <p>Are you sure? This counts as a forfeit.</p>
                        </Modal>
                    )}

                    {incomingCall && (
                        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px 30px', background: '#22c55e', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', zIndex: 2000, animation: 'bounce 1s infinite' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <PhoneIncoming size={32} />
                                <span style={{ fontSize: '20px', fontWeight: 700 }}>Incoming Call...</span>
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>Opponent wants to speak</div>

                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <button onClick={toggleMic} style={{ flex: 1, background: 'white', color: '#22c55e', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>ACCEPT</button>
                                <button onClick={() => {
                                    setIncomingCall(false);
                                    socket.emit('callRejected', { roomId, username });
                                }} style={{ background: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Ignore</button>
                            </div>
                            <style>{`@keyframes bounce { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.05); } }`}</style>
                        </div>
                    )}

                    {/* SIDEBAR */}
                    <div style={{ width: '300px', background: '#18181b', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column' }}>

                        {/* VOICE CONTROL HEADER */}
                        <div style={{ padding: '15px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3f3f46' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Status Ring / Voice Visualizer */}
                                <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* BACK RING (Remote Volume) */}
                                    {opponentStatus === 'online' && (
                                        <div style={{
                                            position: 'absolute',
                                            width: '100%', height: '100%', borderRadius: '50%',
                                            background: '#22c55e',
                                            opacity: 0.3,
                                            transform: `scale(${1 + (remoteVolume / 50)})`,
                                            transition: 'transform 0.05s ease-out'
                                        }}></div>
                                    )}

                                    {/* FRONT RING (Local Volume) */}
                                    <div style={{
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: isMicOn ? '#22c55e' : (opponentStatus === 'online' ? '#f59e0b' : '#71717a'),
                                        boxShadow: isMicOn ? `0 0 ${10 + localVolume}px #22c55e` : 'none',
                                        transition: 'box-shadow 0.05s ease-out',
                                        zIndex: 2
                                    }}></div>
                                </div>


                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Voice Chat</span>
                                    <span style={{ fontSize: '10px', color: '#a1a1aa' }}>
                                        {isMicOn ? 'Call Active' : (opponentStatus === 'online' ? 'Opponent Live' : 'Not Connected')}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {/* 1. NOT CONNECTED & NOT CALLING -> SHOW 'CALL' or 'JOIN' */}
                                {!isMicOn && !isCalling && (
                                    <button
                                        onClick={opponentStatus === 'online' ? toggleMic : requestCall}
                                        style={{
                                            background: opponentStatus === 'online' ? '#22c55e' : '#3f3f46',
                                            border: 'none',
                                            borderRadius: '6px', // Rectangular for text
                                            padding: '0 12px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            transition: '0.2s',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '13px'
                                        }}
                                    >
                                        {opponentStatus === 'online' ? <PhoneIncoming size={16} /> : <Phone size={16} />}
                                        {opponentStatus === 'online' ? "Join Call" : "Call"}
                                    </button>
                                )}

                                {/* 2. CALLING (Waiting) -> SHOW 'CANCEL' */}
                                {isCalling && (
                                    <button
                                        onClick={() => setIsCalling(false)}
                                        style={{
                                            background: '#eab308',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0 12px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '13px'
                                        }}
                                    >
                                        <span>Calling...</span>
                                        <span style={{ fontSize: '10px', opacity: 0.8 }}>(Cancel)</span>
                                    </button>
                                )}

                                {/* 3. CONNECTED -> SHOW 'END CALL' */}
                                {isMicOn && (
                                    <button onClick={toggleMic} style={{ background: '#ef4444', border: 'none', borderRadius: '6px', padding: '0 12px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: '0.2s', color: 'white', fontWeight: 600, fontSize: '13px' }} title="End Call">
                                        <PhoneOff size={16} />
                                        End Call
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Leaderboard Section */}
                        <div style={{ padding: '15px', borderBottom: '1px solid #27272a', flexShrink: 0 }}>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', marginBottom: '10px' }}>
                                <Trophy color="#eab308" size={18} /> Leaderboard
                            </div>
                            {roomState?.users?.sort((a, b) => b.score - a.score).map((u, i) => (
                                <div key={u.id} style={{
                                    padding: '10px',
                                    background: u.id === socket.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                    marginBottom: '5px',
                                    borderRadius: '6px',
                                    border: u.id === socket.id ? '1px solid #22c55e' : (u.status === 'completed' ? '1px solid #22c55e' : '1px solid transparent'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: u.id === socket.id ? '#22c55e' : '#71717a' }}>#{i + 1}</span>
                                        <span style={{ color: 'white', fontSize: '14px', fontWeight: u.id === socket.id ? 'bold' : 'normal' }}>
                                            {u.username} {u.id === socket.id && <span style={{ fontSize: '10px', opacity: 0.6 }}>(You)</span>}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: u.status === 'completed' ? '#22c55e' : '#71717a' }}>{u.score} TC</div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {messages.map((m, idx) => (
                                m.username === 'System' ? (
                                    <div key={idx} style={{ textAlign: 'center', margin: '10px 0', fontSize: '12px', color: '#71717a', fontStyle: 'italic' }}>
                                        {m.message}
                                    </div>
                                ) : (
                                    <div key={idx} style={{ alignSelf: m.username === username ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        {m.username !== username && <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '2px', marginLeft: '4px' }}>{m.username}</div>}
                                        <div style={{
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            borderTopRightRadius: m.username === username ? '2px' : '12px',
                                            borderTopLeftRadius: m.username !== username ? '2px' : '12px',
                                            background: m.username === username ? '#2563eb' : '#3f3f46',
                                            color: 'white',
                                            fontSize: '13px',
                                            wordBreak: 'break-word'
                                        }}>
                                            {m.message}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div style={{ padding: '15px', borderTop: '1px solid #27272a' }}>
                            <div style={{ display: 'flex', gap: '8px', background: '#27272a', padding: '5px', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '13px', padding: '8px', outline: 'none' }}
                                />
                                <button onClick={sendChat} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' }}>
                                    <Send size={16} color={chatInput ? '#2563eb' : '#52525b'} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            style={{ margin: '15px', padding: '10px', background: '#27272a', color: '#ef4444', border: '1px solid #3f3f46', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'background 0.2s', marginTop: '0px' }}
                            onMouseEnter={e => e.target.style.background = '#3f3f46'}
                            onMouseLeave={e => e.target.style.background = '#27272a'}
                        >
                            Leave Room
                        </button>
                    </div>

                    {/* MAIN WORKSPACE */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Workspace
                            problem={problem}
                            roomId={roomId}
                            onBack={() => setShowLeaveConfirm(true)}
                            onSubmissionSuccess={(res) => {
                                socket.emit('submitUpdate', {
                                    roomId,
                                    passedInfo: {
                                        passed: true,
                                        testcases: res.total_testcases || 10
                                    }
                                });
                            }}
                        />

                        {/* DEBUG FOOTER */}
                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: '#555', fontSize: '9px', padding: '2px 5px', pointerEvents: 'none' }}>
                            Room: {roomId} | Socket: {socket.id} | Mic: {isMicOn ? 'ON' : 'OFF'}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};



export default CompetitionRoom;
