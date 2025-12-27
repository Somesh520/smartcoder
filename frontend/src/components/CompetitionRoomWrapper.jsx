import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompetitionRoom from './CompetitionRoom';
import LoadingScreen from './LoadingScreen';

const CompetitionRoomWrapper = ({ socket, roomId, username, roomState, onBack, setRoomId, setUsername }) => {
    const { roomId: urlRoomId } = useParams();

    useEffect(() => {
        // If URL has roomId but state doesn't, update state and join room
        if (urlRoomId && !roomId) {
            console.log("🔗 Detected room from URL:", urlRoomId);
            const defaultUsername = `User_${Math.floor(Math.random() * 1000)}`;
            setRoomId(urlRoomId);
            setUsername(defaultUsername);
            sessionStorage.setItem('active_room_id', urlRoomId);
            sessionStorage.setItem('active_username', defaultUsername);

            const joinLogic = () => {
                if (socket && socket.connected) {
                    console.log("📡 Joining room via socket:", urlRoomId);
                    socket.emit('joinRoom', { roomId: urlRoomId, username: defaultUsername });
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
