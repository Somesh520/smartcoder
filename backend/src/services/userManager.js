
const onlineUsers = new Map();

export class UserManager {
    static addUser(socketId, userData) {
        if (!userData || !userData.userId) return;

        onlineUsers.set(socketId, {
            socketId,
            userId: userData.userId,
            username: userData.username,
            email: userData.email,
            displayName: userData.displayName,
            joinedAt: new Date()
        });

        console.log(`[UserManager] User added: ${userData.username} (${socketId})`);
    }

    static removeUser(socketId) {
        if (onlineUsers.has(socketId)) {
            const user = onlineUsers.get(socketId);
            onlineUsers.delete(socketId);
            console.log(`[UserManager] User removed: ${user.username} (${socketId})`);
            return user;
        }
        return null;
    }

    static getOnlineUsers() {
        // Return unique users
        const uniqueUsers = new Map();

        for (const user of onlineUsers.values()) {
            if (!uniqueUsers.has(user.userId)) {
                uniqueUsers.set(user.userId, user);
            }
        }

        return Array.from(uniqueUsers.values());
    }

    static getUserCount() {
        // Count unique users
        const uniqueIds = new Set();
        for (const user of onlineUsers.values()) {
            uniqueIds.add(user.userId);
        }
        return uniqueIds.size;
    }
}
