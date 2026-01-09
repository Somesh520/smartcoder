import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompetitionRoom from './CompetitionRoom';
import LoadingScreen from './LoadingScreen';

const CompetitionRoomWrapper = ({ socket, roomId, username, roomState, onBack, setRoomId, setUsername, userInfo }) => {
    const { roomId: urlRoomId } = useParams();

    useEffect(() => {
        // LAZY CONNECT: Only connect when we enter the arena
        if (!socket.connected) {
            console.log("🔌 Connecting to Arena Socket...");
            socket.connect();
        }

        const joinLogic = () => {
            if (socket && socket.connected) {
                // ... existing joining logic starts here ...
                // Check rejoin status FRESH on each connection attempt
                const savedRoomId = sessionStorage.getItem('active_room_id');
                const savedUsername = sessionStorage.getItem('active_username');

                // Priority: Valid Prop Username > Saved Session Username > Random Fallback
                // Only generate random if we absolutely have no identity
                const usernameToUse = (username && !username.startsWith('User_')) ? username : (savedUsername || `Guest_${Math.floor(Math.random() * 1000)}`);
                const isRejoin = savedRoomId === urlRoomId && savedUsername === usernameToUse;

                console.log("🔍 Rejoin Check:", { savedRoomId, savedUsername, urlRoomId, isRejoin, usernameToUse });

                // Update state
                setRoomId(urlRoomId);
                setUsername(usernameToUse);
                sessionStorage.setItem('active_room_id', urlRoomId);
                sessionStorage.setItem('active_username', usernameToUse);

                const userId = userInfo?._id;

                if (isRejoin) {
                    console.log("🔄 Rejoining room via socket:", urlRoomId, "as", usernameToUse);
                    socket.emit('rejoinRoom', { roomId: urlRoomId, username: usernameToUse, userId: userId });
                } else {
                    console.log("📡 Joining room via socket:", urlRoomId, "as", usernameToUse);
                    socket.emit('joinRoom', {
                        roomId: urlRoomId,
                        username: usernameToUse,
                        userId: userId
                    });
                }
            }
        };

        if (userInfo?.loggedIn !== false) joinLogic();
        socket.on('connect', joinLogic);
        // Automatically retry joining when previous session is killed
        socket.on('sessionKilled', joinLogic);

        return () => {
            socket.off('connect', joinLogic);
            socket.off('sessionKilled', joinLogic);
            // DO NOT force disconnect here. 
            // The socket is global (owned by App.jsx) and might be needed for error handling/redirects.
            // Leaving the room is handled by 'leaveRoom' emit or server cleanup.
            console.log("🛑 Cleaning up Wrapper listeners (Socket remains connected)");
        };
    }, [urlRoomId]); // Minimized dependencies to prevent re-runs

    const activeRoomId = urlRoomId || roomId;
    const activeUsername = username || sessionStorage.getItem('active_username') || `Guest_${Math.floor(Math.random() * 1000)}`;

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
