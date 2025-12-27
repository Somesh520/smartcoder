import React, { useEffect, useState, useRef } from 'react';
import Workspace from './Workspace';
import { Users, Trophy, MessageSquare, Mic, MicOff, Send, Phone, PhoneIncoming, PhoneOff } from 'lucide-react';
import LoadingScreen from './LoadingScreen';

const CompetitionRoom = ({ socket, roomId, username, roomState, onBack }) => {
    // --- RENDER HELPERS ---
    if (!roomState) return <LoadingScreen text="SYNCHRONIZING BATTLEFIELD..." />;
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

        // If rejoining a finished room, show winner
        if (roomState?.status === 'finished' && roomState?.winner) {
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

    // --- TOAST STATE ---
    const [toast, setToast] = useState(null); // { message, type: 'info' | 'error' }

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


    // --- RENDER HELPERS ---
    if (!roomState) return <LoadingScreen text="SYNCHRONIZING BATTLEFIELD..." />;

    if (roomState.status === 'waiting' || roomState.status === 'starting') {
        const userCount = roomState.users.length;
        const copyLink = () => {
            const url = `${window.location.origin}?room=${roomId}`;
            navigator.clipboard.writeText(url);
            alert("Invite Link Copied! Share it with your friend.");
        };

        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#111' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{userCount === 1 ? "Waiting for Opponent..." : "Opponent Found! Starting Battle..."}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#27272a', padding: '10px 20px', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                    <div style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '16px', letterSpacing: '2px' }}>{roomId}</div>
                    <button onClick={copyLink} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold' }}>
                        <Users size={14} /> Copy Link
                    </button>
                </div>

                <div style={{ marginTop: '20px', color: '#888', fontSize: '14px' }}>{roomState.users.map(u => u.username).join(" vs ")}</div>
                {userCount === 2 && <div style={{ marginTop: '20px', color: 'var(--accent-green)' }}>Preparing Problem...</div>}
            </div>
        );
    }

    const Modal = ({ title, children, actions }) => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#18181b', border: '1px solid #333', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ marginTop: 0, fontSize: '24px', color: 'white' }}>{title}</h2>
                <div style={{ color: '#a1a1aa', margin: '15px 0' }}>{children}</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '25px' }}>{actions}</div>
            </div>
        </div>
    );

    if (!problem) return null;

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* INVISIBLE AUDIO ELEMENT FOR REMOTE STREAM */}
            <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

            {/* MODALS */}
            {winnerModal && (
                <Modal title="🏆 VICTORY!" actions={<button onClick={onBack} style={{ padding: '10px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Return to Lobby</button>}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👑</div>
                    <p>Your opponent fled the battlefield!</p>
                </Modal>
            )}

            {showLeaveConfirm && (
                <Modal title="Leave Battle?" actions={
                    <>
                        <button
                            onClick={() => setShowLeaveConfirm(false)}
                            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowLeaveConfirm(false);
                                onBack(); // Trigger App level leave
                            }}
                            style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Yes, Surrender
                        </button>
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
    );
};

export default CompetitionRoom;
