import { createClient } from 'redis';

const client = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Retry Limit Exceeded');
            return Math.min(retries * 100, 3000);
        }
    }
});

client.on('error', err => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

try {
    await client.connect();
} catch (e) {
    console.error("Failed to connect to Redis immediately:", e.message);
}

export default client;
