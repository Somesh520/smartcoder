import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompetitionRoom from './CompetitionRoom';
import LoadingScreen from './LoadingScreen';

const CompetitionRoomWrapper = ({ socket, roomId, username, roomState, onBack, setRoomId, setUsername }) => {
    const { roomId: urlRoomId } = useParams();

    useEffect(() => {
        // If URL has roomId but state doesn't, update state and join/rejoin room
        if (urlRoomId && !roomId) {
            console.log("🔗 Detected room from URL:", urlRoomId);

            const joinLogic = () => {
                if (socket && socket.connected) {
                    // Check rejoin status FRESH on each connection attempt
                    const savedRoomId = sessionStorage.getItem('active_room_id');
                    const savedUsername = sessionStorage.getItem('active_username');
                    const isRejoin = savedRoomId === urlRoomId && savedUsername;

                    console.log("🔍 Rejoin Check:", { savedRoomId, savedUsername, urlRoomId, isRejoin });

                    const usernameToUse = isRejoin ? savedUsername : `User_${Math.floor(Math.random() * 1000)}`;

                    // Update state
                    setRoomId(urlRoomId);
                    setUsername(usernameToUse);
                    sessionStorage.setItem('active_room_id', urlRoomId);
                    sessionStorage.setItem('active_username', usernameToUse);

                    if (isRejoin) {
                        console.log("🔄 Rejoining room via socket:", urlRoomId, "as", usernameToUse);
                        socket.emit('rejoinRoom', { roomId: urlRoomId, username: usernameToUse });
                        console.log("✅ rejoinRoom event emitted");
                    } else {
                        console.log("📡 Joining room via socket:", urlRoomId);
                        socket.emit('joinRoom', { roomId: urlRoomId, username: usernameToUse });
                    }
                }
            };

            joinLogic();
            socket.on('connect', joinLogic);

            return () => {
                socket.off('connect', joinLogic);
            };
        }
    }, [urlRoomId, roomId, setRoomId, setUsername, socket]);

    const activeRoomId = urlRoomId || roomId;
    const activeUsername = username || `User_${Math.floor(Math.random() * 1000)}`;

    if (!activeRoomId || !username) {
        return <LoadingScreen text="ENTERING ARENA..." />;
    }

    return (
        <CompetitionRoom
            socket={socket}
            roomId={activeRoomId}
            username={activeUsername}
            roomState={roomState}
            onBack={onBack}
        />
    );
};

export default CompetitionRoomWrapper;
