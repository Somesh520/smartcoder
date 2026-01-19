
const rooms = {};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, '../../debug.log');

const log = (msg) => {
    try {
        const timestamp = new Date().toISOString();
        if (!fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, '');
        }
        fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error("Log failed", e);
    }
}

// Fallback Problems (same as server.js)
const FALLBACK_PROBLEMS = [
    { id: 1, title: "Two Sum", slug: "two-sum", difficulty: { level: 1 } },
    { id: 20, title: "Valid Parentheses", slug: "valid-parentheses", difficulty: { level: 1 } },
    { id: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: { level: 1 } },
    { id: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: { level: 1 } },
    { id: 125, title: "Valid Palindrome", slug: "valid-palindrome", difficulty: { level: 1 } },
    { id: 226, title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: { level: 1 } },
    { id: 242, title: "Valid Anagram", slug: "valid-anagram", difficulty: { level: 1 } },
    { id: 704, title: "Binary Search", slug: "binary-search", difficulty: { level: 1 } },
    { id: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: { level: 2 } },
    { id: 11, title: "Container With Most Water", slug: "container-with-most-water", difficulty: { level: 2 } },
    { id: 15, title: "3Sum", slug: "3sum", difficulty: { level: 2 } },
    { id: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: { level: 2 } },
    { id: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: { level: 2 } },
    { id: 49, title: "Group Anagrams", slug: "group-anagrams", difficulty: { level: 2 } },
    { id: 53, title: "Maximum Subarray", slug: "maximum-subarray", difficulty: { level: 2 } },
    { id: 56, title: "Merge Intervals", slug: "merge-intervals", difficulty: { level: 2 } },
    { id: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: { level: 2 } },
    { id: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: { level: 2 } },
    { id: 139, title: "Word Break", slug: "word-break", difficulty: { level: 2 } },
    { id: 152, title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: { level: 2 } },
    { id: 198, title: "House Robber", slug: "house-robber", difficulty: { level: 2 } },
    { id: 200, title: "Number of Islands", slug: "number-of-islands", difficulty: { level: 2 } },
    { id: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: { level: 2 } },
    { id: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: { level: 2 } },
    { id: 322, title: "Coin Change", slug: "coin-change", difficulty: { level: 2 } },
    { id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: { level: 3 } },
    { id: 72, title: "Edit Distance", slug: "edit-distance", difficulty: { level: 3 } },
    { id: 76, title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: { level: 3 } },
    { id: 84, title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: { level: 3 } },
    { id: 124, title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: { level: 3 } },
    { id: 239, title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: { level: 3 } },
    { id: 295, title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: { level: 3 } }
];

export class RoomManager {
    static getRoom(roomId) {
        return rooms[roomId];
    }

    static createRoom(roomId, topic, difficulty, isPublic = true) {
        if (!rooms[roomId]) {

            rooms[roomId] = {
                id: roomId,
                users: [],
                problem: null,
                status: 'waiting',
                topic: topic || 'all',
                difficulty: difficulty || 'Medium',
                isPublic: isPublic,
                messages: []
            };
        }
        return rooms[roomId];
    }

    static joinRoom(roomId, socketId, username) {
        // ... (existing code, no change needed here yet)
        const room = rooms[roomId];
        if (!room) return null;

        const existingUser = room.users.find(u => u.id === socketId);
        if (!existingUser) {
            room.users.push({ id: socketId, username, score: 0, status: 'joined' });

        } else {
            existingUser.username = username;
            existingUser.status = 'joined';
        }
        return room;
    }

    static getPublicRooms() {
        const publicRooms = Object.values(rooms)
            .filter(r => {
                const visible = r.isPublic && r.status === 'waiting' && r.users.length < 5;
                // console.log(`[RoomManager] Room ${r.id}: Public=${r.isPublic}, Status=${r.status}, Users=${r.users.length} -> Visible=${visible}`);
                return visible;
            })
            .map(r => ({
                id: r.id,
                host: r.users[0]?.username || 'Unknown',
                topic: r.topic,
                difficulty: r.difficulty,
                usersCount: r.users.length
            }));

        return publicRooms;
    }

    static removeUser(roomId, socketId) {
        const room = rooms[roomId];
        if (!room) return null;

        const idx = room.users.findIndex(u => u.id === socketId);
        if (idx !== -1) {
            const user = room.users[idx];
            room.users.splice(idx, 1);
            if (room.users.length === 0) {
                delete rooms[roomId];
                return { room, user, deleted: true };
            }
            return { room, user, deleted: false };
        }
        return null;
    }

    static getRooms() {
        return rooms;
    }

    static findRoomByUser(userId) {
        // log(`Checking userId: ${userId}`);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            // log(`Scanning Room ${roomId} Users: ${JSON.stringify(room.users.map(u => ({ id: u.id, userId: u.userId })))}`);
            // Check if user is in this room
            const user = room.users.find(u => String(u.userId) === String(userId));
            if (user) {
                // log(`MATCH FOUND in Room ${roomId}`);
                return { room, user };
            }
        }
        // log(`No match found for ${userId}`);
        return null;
    }

    static getFallbackProblems() {
        return FALLBACK_PROBLEMS;
    }
}
