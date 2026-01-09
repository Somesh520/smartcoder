import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'upDUVultuusI1iUMBUA5y0qfWVzTHYz7',
    socket: {
        host: 'redis-11895.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 11895,
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Retry Limit Exceeded');
            return Math.min(retries * 100, 3000);
        }
    }
});

client.on('error', err => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Don't modify auto-connect behavior here, let server.js or service handle connection lifecycle or just connect immediately.
// Since modules are cached, we can connect on import or provide a connect function.
// For simplicity, we'll auto-connect but handle async nature in usage or top-level await if module type.
// Backend is type: module, so top-level await is supported.

try {
    await client.connect();
} catch (e) {
    console.error("Failed to connect to Redis immediately:", e.message);
}

export default client;
