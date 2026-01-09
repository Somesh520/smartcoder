
import { RoomManager } from '../services/roomManager.js';
import * as leetcodeService from '../services/leetcodeService.js';
import Match from '../models/Match.js';

export const socketHandler = (io) => {
    const disconnectTimeouts = {};

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // JOIN ROOM
        socket.on('joinRoom', async ({ roomId, username, userId, topic, difficulty }) => {
            roomId = String(roomId);

            // 1. Require Registration
            if (!userId) {
                socket.emit('error', "Authentication required to join matches.");
                return;
            }

            console.log(`[CHECK] User ${username} (${userId}) attempting to join ${roomId}`);

            // 1.5. ENFORCE ONE ROOM PER USER - DISABLED BY USER REQUEST
            // const existingSession = RoomManager.findRoomByUser(userId);

            // if (existingSession) {
            //     console.log(`[BLOCK] User found in Room ${existingSession.room.id}`);
            //     // Allow re-joining the SAME room (for refresh/reconnect)
            //     if (String(existingSession.room.id) !== String(roomId)) {
            //         // Send structured error to allow frontend to offer redirection
            //         socket.emit('error', {
            //             message: `You are already in an active battle (Room ${existingSession.room.id}). Finish that first!`,
            //             roomId: existingSession.room.id,
            //             type: 'EXISTING_SESSION'
            //         });
            //         return;
            //     }
            // } else {
            //     console.log(`[CHECK] User ${userId} is clear.`);
            // }

            // 2. Prevent Self-Play (Unique Users only) & Handle Reclaims
            const existingRoom = RoomManager.getRoom(roomId);
            if (existingRoom) {
                const existingUserIndex = existingRoom.users.findIndex(u => u.userId === userId);
                if (existingUserIndex !== -1) {
                    const existingUser = existingRoom.users[existingUserIndex];

                    if (existingUserIndex !== -1) {
                        const existingUser = existingRoom.users[existingUserIndex];

                        // ALWAYS RECLAIM (Whether zombie or active)
                        // This allows a user to "Take Over" their session from another tab/device
                        // without getting blocked by "You cannot join a game against yourself".

                        console.log(`[RECLAIM] User ${username} taking over session ${existingUser.id}`);

                        if (disconnectTimeouts[existingUser.id]) {
                            clearTimeout(disconnectTimeouts[existingUser.id]);
                            delete disconnectTimeouts[existingUser.id];
                        } else {
                            // If active, maybe notify the old socket?
                            // io.to(existingUser.id).emit('error', "Session taken over by another tab.");
                            // The old socket will naturally disconnect if the user closed the tab, 
                            // or will just be orphaned until it disconnects.
                        }

                        // Update ID
                        existingUser.id = socket.id;
                        existingUser.username = username; // Update name just in case
                        existingUser.status = 'joined';
                        if (userId) existingUser.userId = userId;

                        socket.join(roomId);
                        io.to(roomId).emit('roomUpdate', existingRoom);

                        // IF GAME ACTIVE, send gameActive
                        if (existingRoom.status === 'active' || existingRoom.status === 'starting') {
                            socket.emit('gameActive', existingRoom);
                        }

                        return; // Successfully reclaimed
                    }
                }
            }

            socket.join(roomId);

            console.log(`[JOIN] Socket ${socket.id} joined room "${roomId}"`);

            let room = RoomManager.createRoom(roomId, topic, difficulty);
            // Store userId in the room user object
            const user = { id: socket.id, username, userId, score: 0, status: 'attempting' };

            // We need to manually add user since RoomManager.joinRoom might create a default one
            // Let's modify how we use RoomManager or just append directly if allowed, 
            // but RoomManager.joinRoom is cleaner. Let's assume we update RoomManager later or 
            // override here.

            // Actually, RoomManager.joinRoom(roomId, socket.id, username) likely pushes a simple object.
            // Let's verify RoomManager content if possible, but since I can't see it right now, 
            // I'll assume I need to find the user and update it after joining.
            RoomManager.joinRoom(roomId, socket.id, username);

            // Update the user with userId if provided
            const joinedUser = room.users.find(u => u.id === socket.id);
            if (joinedUser && userId) joinedUser.userId = userId;

            // Notify room
            io.to(roomId).emit('roomUpdate', room);

            // If 2 users, Start Game!
            if (room.users.length === 2 && room.status === 'waiting') {
                room.status = 'starting';
                io.to(roomId).emit('roomUpdate', room);
                io.to(roomId).emit('gameStart', { message: "Game Starting in 5 seconds..." });

                // Fetch Random Problem
                try {
                    let allProblems = await leetcodeService.fetchProblems();
                    if (allProblems.stat_status_pairs) allProblems = allProblems.stat_status_pairs;

                    const roomTopic = room.topic || 'all';
                    const roomDiff = room.difficulty || 'Medium';

                    let filtered = allProblems.filter(p => {
                        const isPaid = p.paid_only === true;
                        if (isPaid) return false;

                        let diffLevel = 2;
                        if (roomDiff === 'Easy') diffLevel = 1;
                        if (roomDiff === 'Hard') diffLevel = 3;

                        if (p.difficulty.level !== diffLevel) return false;

                        const title = p.title || (p.stat && p.stat.question__title) || "";
                        if (roomTopic === 'all') return true;
                        return title.toLowerCase().includes(roomTopic.toLowerCase());
                    });

                    if (filtered.length === 0) {
                        let diffLevel = 2;
                        if (roomDiff === 'Easy') diffLevel = 1;
                        if (roomDiff === 'Hard') diffLevel = 3;
                        filtered = allProblems.filter(p => p.difficulty.level === diffLevel && !p.paid_only);
                    }

                    if (filtered.length === 0) {
                        filtered = allProblems.filter(p => p.difficulty.level === 2 && !p.paid_only);
                    }

                    let randomProb = filtered[Math.floor(Math.random() * filtered.length)];

                    if (!randomProb) {
                        console.log("⚠️ API Failed! Using Offline Fallback Pool.");
                        const FALLBACK_PROBLEMS = RoomManager.getFallbackProblems();
                        let diffLevel = 2;
                        if (roomDiff === 'Easy') diffLevel = 1;
                        if (roomDiff === 'Hard') diffLevel = 3;

                        let localFiltered = FALLBACK_PROBLEMS.filter(p => p.difficulty.level === diffLevel);
                        if (localFiltered.length === 0) localFiltered = FALLBACK_PROBLEMS;

                        const pick = localFiltered[Math.floor(Math.random() * localFiltered.length)];
                        room.problem = { id: pick.id, title: pick.title, slug: pick.slug };
                    } else {
                        console.log("Random Problem Selected:", JSON.stringify(randomProb, null, 2));
                        room.problem = {
                            id: randomProb.id || (randomProb.stat && randomProb.stat.question_id),
                            title: randomProb.title || (randomProb.stat && randomProb.stat.question__title),
                            slug: randomProb.title_slug || (randomProb.stat && randomProb.stat.question__title_slug)
                        };
                    }

                    console.log("Room Problem Set:", room.problem);

                    room.status = 'active';
                    room.startTime = Date.now();
                    io.to(roomId).emit('gameActive', room);

                } catch (e) {
                    console.error("Failed to fetch problem for room", e);

                    // FALLBACK ON ERROR
                    console.log("⚠️ API Error! Using Offline Fallback Pool.");
                    const FALLBACK_PROBLEMS = RoomManager.getFallbackProblems();
                    let diffLevel = 2; // Default Medium
                    if (room.difficulty === 'Easy') diffLevel = 1;
                    if (room.difficulty === 'Hard') diffLevel = 3;

                    let localFiltered = FALLBACK_PROBLEMS.filter(p => p.difficulty.level === diffLevel);
                    if (localFiltered.length === 0) localFiltered = FALLBACK_PROBLEMS;

                    const pick = localFiltered[Math.floor(Math.random() * localFiltered.length)];
                    room.problem = { id: pick.id, title: pick.title, slug: pick.slug };

                    room.status = 'active';
                    room.startTime = Date.now();
                    io.to(roomId).emit('gameActive', room);
                }
            }
        });

        // SUBMIT SCORE / UPDATE
        socket.on('submitUpdate', async ({ roomId, passedInfo }) => {
            const room = RoomManager.getRoom(roomId);
            if (room) {
                const user = room.users.find(u => u.id === socket.id);
                if (user) {
                    user.status = passedInfo.passed ? 'completed' : 'attempting';
                    user.score = passedInfo.testcases;

                    if (passedInfo.passed && room.status !== 'finished') {
                        console.log(`[GAME] Winner by Solution: ${user.username}`);
                        room.status = 'finished';
                        room.winner = user.username;

                        const endTime = Date.now();
                        const duration = endTime - (room.startTime || endTime);
                        user.timeTaken = duration;

                        // Save Match to DB
                        saveMatchToDB(room);
                    }
                    io.to(roomId).emit('roomUpdate', room);
                }
            }
        });

        // LEAVE ROOM
        socket.on('leaveRoom', ({ roomId }) => {
            handleLeave(socket.id, roomId, io);
        });

        // CHAT MESSAGE
        socket.on('chatMessage', ({ roomId, message, username }) => {
            const room = RoomManager.getRoom(roomId);
            if (room) {
                const msgData = { username, message, timestamp: new Date().toISOString() };
                room.messages.push(msgData);
                io.to(roomId).emit('chatMessage', msgData);
            }
        });

        // VOICE SIGNALING
        socket.on('voiceSignal', ({ roomId, signal, targetId }) => {
            io.to(targetId).emit('voiceSignal', { signal, senderId: socket.id });
        });

        socket.on('callUser', ({ roomId }) => {
            io.to(String(roomId)).emit('incomingCall', { from: socket.id });
        });

        socket.on('voiceStatus', ({ roomId, status }) => {
            socket.to(roomId).emit('voiceStatus', { userId: socket.id, status });
        });

        socket.on('callRejected', ({ roomId, username }) => {
            socket.to(roomId).emit('callRejected', { username });
        });

        // DISCONNECT
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const rooms = RoomManager.getRooms();
            for (const rId in rooms) {
                const room = rooms[rId];
                const user = room.users.find(u => u.id === socket.id);
                if (user) {
                    if (room.status === 'active') {
                        console.log(`[DISCONNECT] User ${user.username} in active game. Starting grace period...`);
                        disconnectTimeouts[socket.id] = setTimeout(() => {
                            console.log(`[TIMEOUT] User ${user.username} grace period expired. Removed.`);
                            handleLeave(socket.id, rId, io);
                            delete disconnectTimeouts[socket.id];
                        }, 2000);
                    } else {
                        handleLeave(socket.id, rId, io);
                    }
                }
            }
        });

        // REJOIN
        socket.on('rejoinRoom', ({ roomId, username, userId }) => {
            roomId = String(roomId);
            console.log(`[REJOIN] User ${socket.id} (ID: ${userId}) re-joining room ${roomId}`);

            // 1. ENFORCE ONE ROOM PER USER - DISABLED BY USER REQUEST
            // const existingSession = RoomManager.findRoomByUser(userId);

            // if (existingSession) {
            //     console.log(`[BLOCK-REJOIN] User found in Room ${existingSession.room.id}`);
            //     // Allow re-joining the SAME room
            //     if (String(existingSession.room.id) !== String(roomId)) {
            //         socket.emit('error', {
            //             message: `You are already in an active battle (Room ${existingSession.room.id}). Finish that first!`,
            //             roomId: existingSession.room.id,
            //             type: 'EXISTING_SESSION'
            //         });
            //         return;
            //     }
            // }

            const room = RoomManager.getRoom(roomId);

            if (!room) {
                socket.emit('error', "Room expired or does not exist.");
                return;
            }

            // Find by userId (Preferred) or Username (Fallback)
            let user = null;
            if (userId) user = room.users.find(u => u.userId === userId);
            if (!user) user = room.users.find(u => u.username === username);

            if (user) {
                if (disconnectTimeouts[user.id]) {
                    clearTimeout(disconnectTimeouts[user.id]);
                    delete disconnectTimeouts[user.id];
                }
                user.id = socket.id;
                // Ensure userId is set if it was missing
                if (userId && !user.userId) user.userId = userId;

                socket.join(roomId);
                io.to(roomId).emit('roomUpdate', room);
            } else {
                console.log(`[REJOIN] New user entry for ${username} in existing room`);
                room.users.push({ id: socket.id, username, userId, score: 0, status: 'joined' });
                socket.join(roomId);
                io.to(roomId).emit('roomUpdate', room);
            }
        });

        // KILL SESSION (Force End Previous Room)
        socket.on('killSession', ({ userId }) => {
            console.log(`[KILL-REQ] User ${socket.id} requesting kill for userId: ${userId}`);
            const existingSession = RoomManager.findRoomByUser(userId);

            if (existingSession) {
                const { room, user } = existingSession;
                console.log(`[KILL-FOUND] Found session in Room ${room.id} (Socket: ${user.id}). Killing...`);

                if (disconnectTimeouts[user.id]) {
                    clearTimeout(disconnectTimeouts[user.id]);
                    delete disconnectTimeouts[user.id];
                }

                // Force remove
                const result = RoomManager.removeUser(room.id, user.id);
                if (result) {
                    console.log(`[KILL-SUCCESS] User removed from DB.`);

                    // No need to send error. The session is dead.
                    // If we send error, it might reach the new socket or confuse the user.

                    // Treat as leave for the ROOM (notify others)
                    const { deleted } = result;
                    if (room && !deleted) io.to(room.id).emit('roomUpdate', room);

                    // If game was active, handle match save/winner
                    const wasActive = room && (room.status === 'active' || room.status === 'starting');
                    if (wasActive) {
                        const winnerText = "No Winner (User Left)";
                        room.status = 'finished';
                        room.winner = winnerText;
                        io.to(room.id).emit('playerLeft', { winner: winnerText });
                        io.to(room.id).emit('roomUpdate', room);
                        saveMatchToDB(room, [...room.users, user], winnerText);
                    } else if (room.status === 'waiting' && deleted) {
                        console.log("Room deleted (waiting phase).");
                    }
                }

                // IMPORTANT: Tell the frontend to Retry
                socket.emit('sessionKilled', { message: "Previous session ended. Re-joining..." });
            } else {
                console.log(`[KILL-NONE] No active session found to kill.`);
                socket.emit('sessionKilled', { message: "No active session found. Retrying..." });
            }
        });
    });

    const saveMatchToDB = async (room, specificPlayers = null, specificWinner = null) => {
        try {
            const playersToSave = specificPlayers || room.users;
            const match = new Match({
                roomId: room.id,
                problem: room.problem,
                players: playersToSave.map(u => ({
                    userId: u.userId || null,
                    username: u.username,
                    status: u.status,
                    score: u.score,
                    timeTaken: u.timeTaken || 0
                })),
                winner: specificWinner || room.winner
            });
            await match.save();
            console.log("✅ Match saved to DB:", match._id);
        } catch (err) {
            console.error("❌ Failed to save match:", err);
        }
    };

    const handleLeave = (socketId, roomId, io) => {
        console.log(`[LEAVE] Socket ${socketId} leaving Room ${roomId}`);
        const result = RoomManager.removeUser(roomId, socketId);
        if (result) {
            const { room, user, deleted } = result;
            console.log(`[LEAVE-OK] Removed ${user.username}. Room deleted? ${deleted}`);

            // Notify others
            if (room) io.to(roomId).emit('roomUpdate', room);

            // If Game was Active/Starting and NOT deleted (someone left behind)
            // OR if deleted but was active (last person left)
            const wasActive = room && (room.status === 'active' || room.status === 'starting');

            if (wasActive && !deleted) {
                // Opponent Left -> Remaining User Wins (BUT user wants "No Winner" text)
                // Actually, if opponent leaves, usually remaining wins. 
                // User said: "winner mat bana likhe de no winner user leave"

                const winnerText = "No Winner (User Left)";

                room.status = 'finished';
                room.winner = winnerText;

                io.to(roomId).emit('playerLeft', { winner: winnerText });
                io.to(roomId).emit('roomUpdate', room);

                // SAVE MATCH
                // We must include the leaver (user) + remaining (room.users)
                const allPlayers = [...room.users, user];
                saveMatchToDB(room, allPlayers, winnerText);
            } else if (wasActive && deleted) {
                // Room deleted (Last player left) or Single Player
                const winnerText = "No Winner (User Left)";
                console.log(`[ROOM] Room ${roomId} deleted (Last User: ${user.username}). Saving final state...`);

                // If it was active, it means this user was playing (alone or last)
                // We should save this session.
                const allPlayers = [user];

                // We don't need to emit updates (room is gone)
                saveMatchToDB(room, allPlayers, winnerText);
            }
        }
    };
};
