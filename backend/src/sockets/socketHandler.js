
import { RoomManager } from '../services/roomManager.js';
import * as leetcodeService from '../services/leetcodeService.js';
import Match from '../models/Match.js';

export const socketHandler = (io) => {
    const disconnectTimeouts = {};

    const broadcastPublicRooms = () => {
        const rooms = RoomManager.getPublicRooms();
        io.emit('publicRoomsUpdate', rooms);
    };

    io.on('connection', (socket) => {


        // JOIN ROOM
        socket.on('joinRoom', async ({ roomId, username, userId, topic, difficulty, isPublic, specificProblem }) => {
            console.log(`[JoinRoom] Request for ${roomId} by ${username}. SpecificProblem: "${specificProblem}"`);
            roomId = String(roomId);

            // 1. Require Registration
            if (!userId) {
                socket.emit('error', "Authentication required to join matches.");
                return;
            }

            // 2. Prevent Self-Play (Unique Users only) & Handle Reclaims
            const existingRoom = RoomManager.getRoom(roomId);
            if (existingRoom) {
                const existingUserIndex = existingRoom.users.findIndex(u => u.userId === userId);
                if (existingUserIndex !== -1) {
                    const existingUser = existingRoom.users[existingUserIndex];

                    if (existingUserIndex !== -1) {
                        const existingUser = existingRoom.users[existingUserIndex];

                        // ALWAYS RECLAIM (Whether zombie or active)
                        if (disconnectTimeouts[existingUser.id]) {
                            clearTimeout(disconnectTimeouts[existingUser.id]);
                            delete disconnectTimeouts[existingUser.id];
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

            let room = RoomManager.createRoom(roomId, topic, difficulty, isPublic);
            if (specificProblem) {
                console.log(`[JoinRoom] Setting specificProblem for room ${roomId}: ${specificProblem}`);
                room.specificProblem = specificProblem; // Store constraint
            }

            // Store userId in the room user object
            const user = { id: socket.id, username, userId, score: 0, status: 'attempting' };

            RoomManager.joinRoom(roomId, socket.id, username);

            // Update the user with userId if provided
            const joinedUser = room.users.find(u => u.id === socket.id);
            if (joinedUser && userId) joinedUser.userId = userId;

            // Notify room
            io.to(roomId).emit('roomUpdate', room);
            broadcastPublicRooms();
        });

        // MANUAL START GAME
        socket.on('startGame', async ({ roomId }) => {
            const room = RoomManager.getRoom(roomId);
            if (!room) return;

            // Only Host (first user) can start
            if (room.users[0].id !== socket.id) {
                return; // Ignore if not host
            }

            if (room.users.length < 2) {
                // socket.emit('error', "Need at least 2 players to start!"); 
                return;
            }

            if (room.status !== 'waiting') return; // Already started

            room.status = 'starting';
            io.to(roomId).emit('roomUpdate', room);
            broadcastPublicRooms(); // Remove from public list
            io.to(roomId).emit('gameStart', { message: room.specificProblem ? "Starting Custom Challenge..." : "Host started the battle! Starting in 5 seconds..." });

            // Fetch Random Problem
            try {
                let allProblems = await leetcodeService.fetchProblems();
                if (allProblems.stat_status_pairs) allProblems = allProblems.stat_status_pairs;

                // 1. SPECIFIC PROBLEM OVERRIDE
                if (room.specificProblem) {
                    const targetSlug = room.specificProblem.toLowerCase();
                    console.log(`[StartGame] Searching for specific problem: "${targetSlug}" in ${allProblems.length} problems`);

                    const specificMatch = allProblems.find(p => {
                        const pSlug = (p.slug || p.titleSlug || p.stat?.question__title_slug || "").toLowerCase();
                        const pId = String(p.id || p.questionId || p.stat?.question_id || "");
                        return pSlug === targetSlug || pId === targetSlug;
                    });

                    if (specificMatch) {
                        console.log(`[StartGame] Match Found in Cache! ID: ${specificMatch.id || specificMatch.stat?.question_id}`);

                        const isPaid = specificMatch.paid_only === true || specificMatch.paid === true;
                        if (!isPaid) {
                            const pSlug = specificMatch.slug || specificMatch.titleSlug || specificMatch.stat?.question__title_slug;
                            const pTitle = specificMatch.title || specificMatch.stat?.question__title;
                            const pId = specificMatch.id || specificMatch.questionId || specificMatch.stat?.question_id;

                            console.log(`[GameStart] Using Specific Problem: ${pSlug}`);
                            room.problem = {
                                id: pId,
                                title: pTitle,
                                slug: pSlug
                            };

                            room.status = 'active';
                            room.startTime = Date.now();
                            io.to(roomId).emit('gameActive', room);
                            return; // Exit early
                        } else {
                            console.warn(`[GameStart] Specific problem is PAID. Falling back.`);
                            io.to(roomId).emit('chatMessage', { username: "System", message: "⚠️ Custom problem is Premium/Locked. Using random instead." });
                        }
                    } else {
                        // FALLBACK: Fetch Individual Problem Details
                        console.warn(`[StartGame] Problem NOT found in cache (${allProblems.length} items). Fetching direct details for: ${targetSlug}`);

                        try {
                            const details = await leetcodeService.fetchProblemDetails(targetSlug);
                            const q = details?.data?.question;

                            if (q) {
                                if (q.isPaidOnly) {
                                    io.to(roomId).emit('chatMessage', { username: "System", message: "⚠️ Custom problem is Premium. Using random." });
                                } else {
                                    console.log(`[GameStart] Fetched Direct: ${q.titleSlug}`);
                                    room.problem = {
                                        id: q.questionId,
                                        title: q.title,
                                        slug: q.titleSlug
                                    };

                                    room.status = 'active';
                                    room.startTime = Date.now();
                                    io.to(roomId).emit('gameActive', room);
                                    return;
                                }
                            } else {
                                throw new Error("Question data missing");
                            }
                        } catch (err) {
                            console.error(`[StartGame] Direct fetch failed for ${targetSlug}:`, err.message);
                            io.to(roomId).emit('chatMessage', { username: "System", message: `⚠️ Problem "${targetSlug}" not found. Using random.` });
                        }
                    }
                } else {
                    console.log("[StartGame] No specific problem set. Using random.");
                }

                // 2. RANDOM FALLBACK (Existing Logic)
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

                    const FALLBACK_PROBLEMS = RoomManager.getFallbackProblems();
                    let diffLevel = 2;
                    if (roomDiff === 'Easy') diffLevel = 1;
                    if (roomDiff === 'Hard') diffLevel = 3;

                    let localFiltered = FALLBACK_PROBLEMS.filter(p => p.difficulty.level === diffLevel);
                    if (localFiltered.length === 0) localFiltered = FALLBACK_PROBLEMS;

                    const pick = localFiltered[Math.floor(Math.random() * localFiltered.length)];
                    room.problem = { id: pick.id, title: pick.title, slug: pick.slug };
                } else {

                    room.problem = {
                        id: randomProb.id || (randomProb.stat && randomProb.stat.question_id),
                        title: randomProb.title || (randomProb.stat && randomProb.stat.question__title),
                        slug: randomProb.title_slug || (randomProb.stat && randomProb.stat.question__title_slug)
                    };
                }

                room.status = 'active';
                room.startTime = Date.now();
                io.to(roomId).emit('gameActive', room);

            } catch (e) {
                console.error("Failed to fetch problem for room", e);

                // FALLBACK ON ERROR

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

        // --- CHILL ZONE (GLOBAL CHAT) ---
        socket.on('join_chill_room', ({ username }) => {
            const CHILL_ROOM = 'chill-zone';
            socket.join(CHILL_ROOM);
        });

        socket.on('send_chill_message', ({ username, text, type }) => {
            const CHILL_ROOM = 'chill-zone';
            const msg = {
                id: Date.now() + Math.random(),
                username,
                text,
                type: type || 'user',
                timestamp: new Date().toISOString()
            };
            io.to(CHILL_ROOM).emit('chill_message', msg);
        });

        socket.on('disconnect', () => {

            const rooms = RoomManager.getRooms();
            for (const rId in rooms) {
                const room = rooms[rId];
                const user = room.users.find(u => u.id === socket.id);
                if (user) {
                    if (room.status === 'active') {

                        disconnectTimeouts[socket.id] = setTimeout(() => {

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


            // 1. ENFORCE ONE ROOM PER USER - DISABLED BY USER REQUEST
            // const existingSession = RoomManager.findRoomByUser(userId);

            // if (existingSession) {

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

                room.users.push({ id: socket.id, username, userId, score: 0, status: 'joined' });
                socket.join(roomId);
                io.to(roomId).emit('roomUpdate', room);
            }
            broadcastPublicRooms();
        });

        // KILL SESSION (Force End Previous Room)
        socket.on('killSession', ({ userId }) => {

            const existingSession = RoomManager.findRoomByUser(userId);

            if (existingSession) {
                const { room, user } = existingSession;


                if (disconnectTimeouts[user.id]) {
                    clearTimeout(disconnectTimeouts[user.id]);
                    delete disconnectTimeouts[user.id];
                }

                // Force remove
                const result = RoomManager.removeUser(room.id, user.id);
                if (result) {


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

                    }
                }

                // IMPORTANT: Tell the frontend to Retry
                socket.emit('sessionKilled', { message: "Previous session ended. Re-joining..." });
            } else {

                socket.emit('sessionKilled', { message: "No active session found. Retrying..." });
            }
        });

        // REQUEST PUBLIC ROOMS
        socket.on('getPublicRooms', () => {
            socket.emit('publicRoomsUpdate', RoomManager.getPublicRooms());
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

        } catch (err) {
            console.error("❌ Failed to save match:", err);
        }
    };

    const handleLeave = (socketId, roomId, io) => {

        const result = RoomManager.removeUser(roomId, socketId);
        if (result) {
            const { room, user, deleted } = result;


            // Notify others
            if (room) io.to(roomId).emit('roomUpdate', room);

            // If Game was Active/Starting and NOT deleted (someone left behind)
            // OR if deleted but was active (last person left)
            const wasActive = room && (room.status === 'active' || room.status === 'starting');

            if (wasActive && !deleted) {
                // Modified Logic: Only end game if < 2 players remain (e.g. 1v1 and someone left, or last survivor)
                if (room.users.length < 2) {
                    const winnerText = "No Winner (User Left)";
                    room.status = 'finished';
                    room.winner = winnerText;

                    io.to(roomId).emit('playerLeft', { winner: winnerText, leaver: user });
                    io.to(roomId).emit('roomUpdate', room);

                    // SAVE MATCH
                    const allPlayers = [...room.users, user];
                    saveMatchToDB(room, allPlayers, winnerText);
                } else {
                    // Game Continues!

                    io.to(roomId).emit('chatMessage', {
                        username: "System",
                        message: `🚫 ${user.username} left the battle.`,
                        timestamp: new Date().toISOString()
                    });
                    // Just update the room (user list changed)
                    io.to(roomId).emit('roomUpdate', room);
                }
            } else if (wasActive && deleted) {
                // ... (existing code)
                saveMatchToDB(room, allPlayers, winnerText);
            }

            broadcastPublicRooms();
        }
    };
};
