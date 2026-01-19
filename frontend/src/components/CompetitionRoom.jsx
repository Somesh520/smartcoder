
import React, { useEffect, useState, useRef } from 'react';
import Workspace from './Workspace';
import { Users, Trophy, MessageSquare, Mic, MicOff, Send, Phone, PhoneIncoming, PhoneOff, Sword, Loader, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
    const [leavers, setLeavers] = useState([]); // Track users who left to show in results

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
    const [showResults, setShowResults] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

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

    // --- SYNC WINNER STATE ---
    useEffect(() => {
        if (roomState && roomState.status === 'finished' && roomState.winner) {
            console.log("🏆 Game Finished via RoomUpdate. Winner:", roomState.winner);
            setWinnerModal(roomState.winner);
        }
    }, [roomState]);

    // --- SOCKET HANDLERS ---
    useEffect(() => {
        const handlePlayerLeft = ({ winner, leaver }) => {
            if (winner) setWinnerModal(winner);

            if (leaver) {
                console.log("Opponent Left:", leaver.username);
                setLeavers(prev => {
                    if (prev.find(u => u.username === leaver.username)) return prev;
                    return [...prev, { ...leaver, status: 'forfeited' }];
                });
            }

            // If they left, the call definitely ended.
            // Force cleanup and notify if we were in a call or just strictly show it.
            if (opponentStatus === 'online' || isMicOn) {
                setOpponentStatus('offline'); // FIXED: Ensure UI updates to "Call" not "Join"
                endCall(false); // Don't emit 'offline' back, they are gone.
                showToast(leaver ? `${leaver.username} left(Call Ended)` : "Opponent left the match (Call Ended)", 'info');
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
                        console.log(`[ICE] Queuing candidate for ${senderId}(Remote Description not set)`);
                        if (!candidateQueueRef.current[senderId]) candidateQueueRef.current[senderId] = [];
                        candidateQueueRef.current[senderId].push(signal.candidate);
                    }
                }
            }
        };
        const handleCallRejected = ({ username }) => {
            setIsCalling(false); // Stop calling state
            showToast(`Called Ignored by ${username} `, 'error');
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
    <style>{`@keyframes slideDown { from { transform: translate(-50 %, -100 %); opacity: 0; } to { transform: translate(-50 %, 0); opacity: 1; } } `}</style>

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
                        // Find opponent by checking who is NOT me (by Socket ID)
                        // If same username (testing mode), we still want to show them.
                        const opponent = roomState.users.find(u => u.id !== socket.id);
                        const isStarting = roomState.status === 'starting';

                        const copyLink = () => {
                            const url = `${window.location.origin}?room = ${roomId} `;
                            navigator.clipboard.writeText(url);
                            showToast("Invite Link Copied!", 'info');
                        };

                        return (
                            <>
                                {/* ANIMATIONS & STYLES */}
                                <style>{`
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-100px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { 0 % { transform: scale(0); } 80 % { transform: scale(1.1); } 100 % { transform: scale(1); } }
@keyframes spin - slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ping { 75 %, 100 % { transform: scale(2); opacity: 0; } }
@keyframes pulse - fast { 0 %, 100 % { transform: scale(1); filter: brightness(1); } 50 % { transform: scale(1.05); filter: brightness(1.3); } }
@keyframes glitch {
    0 % { transform: translate(0); }
    20 % { transform: translate(-2px, 2px); }
    40 % { transform: translate(-2px, -2px); }
    60 % { transform: translate(2px, 2px); }
    80 % { transform: translate(2px, -2px); }
    100 % { transform: translate(0); }
}
@keyframes float { 0 %, 100 % { transform: translateY(0); } 50 % { transform: translateY(-10px); } }
`}</style>

                                {/* Background Grid & Glow */}
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'radial-gradient(circle at center, #1e1e24 0%, #000 100%)' }} />
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.15 }} />

                                {/* --- HYBRID LAYOUT CONTENT --- */}

                                {userCount <= 2 ? (
                                    /* --- 1v1 CLASSIC LAYOUT --- */
                                    <div style={{ display: 'flex', width: '100%', maxWidth: '1000px', height: '400px', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, padding: '0 40px' }}>

                                        {/* VS Badge (Absolute Center) */}
                                        <div style={{
                                            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                                            zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <div style={{
                                                width: '100px', height: '100px', borderRadius: '50%', background: '#09090b',
                                                border: '4px solid #f59e0b', boxShadow: '0 0 50px rgba(245, 158, 11, 0.5)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '40px', fontWeight: 900, color: '#f59e0b', fontStyle: 'italic',
                                                animation: isStarting ? 'glitch 0.2s infinite' : 'pulse-fast 2s infinite'
                                            }}>
                                                VS
                                            </div>
                                        </div>

                                        {/* PLAYER 1 (YOU) */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                                            <div style={{
                                                width: '140px', height: '140px', borderRadius: '50%',
                                                background: `linear - gradient(135deg, #22c55e, #10b981)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
                                                marginBottom: '24px', border: '5px solid #fff',
                                                animation: isStarting ? 'glitch 0.3s infinite' : 'float 6s ease-in-out infinite'
                                            }}>
                                                <Users size={70} color="white" />
                                            </div>
                                            <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '8px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{username}</h2>
                                            <div style={{ padding: '6px 20px', background: '#22c55e20', color: '#4ade80', borderRadius: '20px', fontSize: '14px', fontWeight: 700, border: '1px solid #22c55e50' }}>READY</div>
                                        </div>

                                        {/* PLAYER 2 (OPPONENT or SEARCHING) */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideInRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                                            {opponent ? (
                                                <>
                                                    <div style={{
                                                        width: '140px', height: '140px', borderRadius: '50%',
                                                        background: `linear - gradient(135deg, #ef4444, #dc2626)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 0 50px rgba(239, 68, 68, 0.5)',
                                                        marginBottom: '24px', border: '5px solid #fff',
                                                        animation: isStarting ? 'glitch 0.3s infinite' : 'float 6s ease-in-out infinite 1s' /* Delayed float */
                                                    }}>
                                                        <Sword size={70} color="white" />
                                                    </div>
                                                    <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '8px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{opponent.username}</h2>
                                                    <div style={{ padding: '6px 20px', background: '#ef444420', color: '#f87171', borderRadius: '20px', fontSize: '14px', fontWeight: 700, border: '1px solid #ef444450' }}>CONNECTED</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '4px dashed #52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'spin-slow 10s linear infinite' }}>
                                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.1, background: 'white' }}></div>
                                                    </div>
                                                    <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#71717a', marginBottom: '8px', fontStyle: 'italic' }}>Searching...</h2>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* --- BATTLE ROYALE LAYOUT (3+ Players) --- */
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 10, marginTop: '-50px' }}>

                                        {/* BR TITLE */}
                                        <div style={{ marginBottom: '50px', textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
                                            <h1 style={{
                                                fontSize: '60px', fontWeight: 900, color: 'white', margin: 0,
                                                textShadow: '0 0 20px #f59e0b', letterSpacing: '-2px',
                                                fontStyle: 'italic',
                                                animation: isStarting ? 'glitch 0.2s infinite' : 'none'
                                            }}>
                                                BATTLE <span style={{ color: '#f59e0b' }}>ROYALE</span>
                                            </h1>
                                            <div style={{ color: '#a1a1aa', fontSize: '16px', letterSpacing: '2px', fontWeight: 600 }}>{userCount} FIGHTERS READY</div>
                                        </div>

                                        {/* PLAYERS GRID */}
                                        <div style={{
                                            display: 'flex', flexWrap: 'wrap',
                                            alignItems: 'center', justifyContent: 'center',
                                            gap: '30px', maxWidth: '1200px'
                                        }}>
                                            {roomState.users.map((u, i) => {
                                                const isDistorted = isStarting && Math.random() > 0.5;
                                                return (
                                                    <div key={u.id} style={{
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                        animation: `popIn 0.4s cubic - bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.1}s backwards`,
                                                        transform: isDistorted ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` : 'none'
                                                    }}>

                                                        {/* Avatar Circle */}
                                                        <div style={{
                                                            width: '100px', height: '100px', borderRadius: '50%',
                                                            background: u.id === socket.id ? '#22c55e' : (i % 2 === 0 ? '#3b82f6' : '#ef4444'),
                                                            border: '4px solid white',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: u.id === socket.id ? '0 0 30px #22c55e' : '0 0 20px rgba(0,0,0,0.5)',
                                                            marginBottom: '10px', position: 'relative'
                                                        }}>
                                                            {i === 0 && <div style={{ position: 'absolute', top: '-20px', fontSize: '24px', animation: 'float 3s infinite' }}>👑</div>}
                                                            {u.id === socket.id ? <Users size={40} color="white" /> : <Sword size={40} color="white" />}
                                                        </div>

                                                        {/* Name Tag */}
                                                        <div style={{ background: '#18181b', padding: '5px 15px', borderRadius: '10px', border: '1px solid #333' }}>
                                                            <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{u.username}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* ADD SLOT (Only 1, to imply more can join) */}
                                            {userCount < 5 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, animation: 'fadeInUp 1s ease-out' }}>
                                                    <div style={{
                                                        width: '100px', height: '100px', borderRadius: '50%', border: '4px dashed #52525b',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'
                                                    }}>
                                                        <span style={{ fontSize: '30px', color: '#52525b' }}>+</span>
                                                    </div>
                                                    <div style={{ color: '#52525b', fontSize: '12px', fontWeight: 600 }}>WAITING...</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ zIndex: 10, marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                    {isStarting ? (
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24', animation: 'pulse 1s infinite' }}>
                                            BATTLE STARTING IN 3...
                                        </div>
                                    ) : (
                                        <div style={{ background: '#18181b', padding: '16px 24px', borderRadius: '16px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>

                                            {/* HOST START BUTTON */}
                                            {roomState.users?.[0]?.id === socket.id && (
                                                <button
                                                    onClick={() => socket.emit('startGame', { roomId })}
                                                    disabled={userCount < 2}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: userCount >= 2 ? '#eab308' : '#3f3f46',
                                                        color: userCount >= 2 ? 'black' : '#71717a',
                                                        fontWeight: 700,
                                                        fontSize: '16px',
                                                        cursor: userCount >= 2 ? 'pointer' : 'not-allowed',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <Sword size={20} />
                                                    {userCount < 2 ? "Waiting for Players..." : "START BATTLE"}
                                                </button>
                                            )}

                                            {!roomState.users?.[0]?.id === socket.id && (
                                                <div style={{ color: '#fbbf24', fontWeight: 600 }}>Waiting for Host to Start...</div>
                                            )}

                                            <div style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: 500 }}>INVITE A FRIEND ({userCount}/5)</div>
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
@keyframes spin - slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ping { 75 %, 100 % { transform: scale(2); opacity: 0; } }
@keyframes pulse - fast { 0 %, 100 % { transform: translate(-50 %, -50 %) scale(1); } 50 % { transform: translate(-50 %, -50 %) scale(1.1); } }
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

                            {(() => {
                                const isUserLeft = winnerModal.includes("User Left");
                                const isVictory = winnerModal === username;

                                return (
                                    <>
                                        <div style={{
                                            fontSize: '80px', fontWeight: 900,
                                            background: isVictory ? 'linear-gradient(to bottom, #4ade80, #22c55e)' : (isUserLeft ? 'linear-gradient(to bottom, #fbbf24, #d97706)' : 'linear-gradient(to bottom, #f87171, #ef4444)'),
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                            textShadow: isVictory ? '0 0 50px rgba(34, 197, 94, 0.5)' : (isUserLeft ? '0 0 50px rgba(251, 191, 36, 0.5)' : '0 0 50px rgba(239, 68, 68, 0.5)'),
                                            marginBottom: '20px',
                                            letterSpacing: '-2px',
                                            animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }}>
                                            {isVictory ? "VICTORY" : (isUserLeft ? "MATCH ENDED" : "DEFEAT")}
                                        </div>

                                        <div style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '60px', fontWeight: 500, textAlign: 'center' }}>
                                            {isVictory ? "You solved it first! 🚀" : (isUserLeft ? "Opponent forfeited the match." : `${winnerModal} claimed the victory.`)}
                                        </div>
                                    </>
                                );
                            })()}

                            {/* RESULTS TABLE */}
                            <div style={{
                                width: '100%', maxWidth: '700px',
                                background: '#18181b', borderRadius: '24px',
                                border: '1px solid #27272a',
                                padding: '30px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr', paddingBottom: '16px', borderBottom: '1px solid #333', color: '#71717a', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                                    <div>#</div>
                                    <div>Player</div>
                                    <div style={{ textAlign: 'center' }}>Test Cases</div>
                                    <div style={{ textAlign: 'right' }}>Time</div>
                                </div>

                                {[...roomState.users, ...leavers].sort((a, b) => {
                                    // Sort by Status (completed first) -> Score (desc) -> Time (asc)
                                    if (a.status === 'completed' && b.status !== 'completed') return -1;
                                    if (b.status === 'completed' && a.status !== 'completed') return 1;
                                    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
                                    return (a.timeTaken || Infinity) - (b.timeTaken || Infinity);
                                }).map((u, i) => {
                                    const isWinner = u.username === winnerModal;
                                    const isMe = u.username === username;
                                    const isLeaver = leavers.some(l => l.username === u.username);
                                    const formatTime = (ms) => {
                                        if (!ms) return "--:--";
                                        const mins = Math.floor(ms / 60000);
                                        const secs = Math.floor((ms % 60000) / 1000);
                                        return `${mins}m ${secs} s`;
                                    };

                                    return (
                                        <div key={u.id} style={{
                                            display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr', alignItems: 'center',
                                            padding: '16px', marginBottom: '8px',
                                            background: isWinner ? 'rgba(34, 197, 94, 0.1)' : (isMe ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                                            borderRadius: '12px',
                                            border: isWinner ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                                            transition: 'background 0.2s'
                                        }}>
                                            {/* RANK */}
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: i === 0 ? '#f59e0b' : (i === 1 ? '#94a3b8' : '#71717a'),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '14px', fontWeight: 700, color: 'white'
                                            }}>
                                                {i + 1}
                                            </div>

                                            {/* PLAYER INFO */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '16px', fontWeight: 700, color: isLeaver ? '#ef4444' : 'white', opacity: isLeaver ? 0.7 : 1 }}>
                                                    {u.username}
                                                    {isMe && <span style={{ fontSize: '11px', color: '#a1a1aa', background: '#333', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>YOU</span>}
                                                    {isLeaver && <span style={{ fontSize: '11px', color: '#ef4444', border: '1px solid #ef4444', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>LEFT</span>}
                                                </span>
                                                {u.status === 'completed' && <Trophy size={14} color="#f59e0b" />}
                                            </div>

                                            {/* TEST CASES */}
                                            <div style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px',
                                                    background: u.status === 'completed' ? '#22c55e20' : '#3f3f46',
                                                    color: u.status === 'completed' ? '#4ade80' : '#a1a1aa',
                                                    fontSize: '13px', fontWeight: 600
                                                }}>
                                                    {u.status === 'completed' ? 'ALL PASSED' : (isLeaver ? 'FORFEIT' : `${u.score || 0} / ?`)}
                                                </span >
                                            </div >

                                            {/* TIME */}
                                            < div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '15px', color: u.timeTaken ? 'white' : '#52525b' }}>
                                                {u.timeTaken ? formatTime(u.timeTaken) : "--:--"}
                                            </div >
                                        </div >
                                    );
                                })}
                            </div >

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
                        </div >
                    )}

                    {
                        showLeaveConfirm && (
                            <Modal title="Leave Battle?" actions={
                                <>
                                    <button onClick={() => setShowLeaveConfirm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={() => { setShowLeaveConfirm(false); onBack(); }} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Yes, Surrender</button>
                                </>
                            }>
                                <p>Are you sure? This counts as a forfeit.</p>
                            </Modal>
                        )
                    }

                    {
                        incomingCall && (
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
                        )
                    }

                    {/* SIDEBAR */}
                    <div style={{
                        width: isSidebarOpen ? '260px' : '0px',
                        opacity: isSidebarOpen ? 1 : 0,
                        background: '#1c1c1c',
                        borderRight: isSidebarOpen ? '1px solid #333' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>

                        {/* VOICE CONTROL HEADER */}
                        <div style={{ padding: '15px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3f3f46' }}>
                            {/* Collapse Button (Only visual if open) */}
                            <div style={{ position: 'absolute', right: '10px', top: '55px', zIndex: 10 }}>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    style={{
                                        background: '#27272a', border: '1px solid #3f3f46', borderRadius: '50%',
                                        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: '#a1a1aa'
                                    }}
                                    title="Collapse Sidebar"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                            </div>
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

                    {/* MAIN WORKSPACE - RELATIVE FOR OVERLAYS */}
                    <div style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>

                        {/* EXPAND SIDEBAR BUTTON (Floating) */}
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                style={{
                                    position: 'absolute', top: '20px', left: '20px', zIndex: 50,
                                    background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px',
                                    padding: '8px', cursor: 'pointer', color: 'white',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >
                                <PanelLeftOpen size={18} />
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>Open Menu</span>
                            </button>
                        )}                    <Workspace
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
                </div >
            ) : null}
        </div >
    );
};



export default CompetitionRoom;
