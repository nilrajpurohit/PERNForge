import { createClient } from 'redis';
import { config } from '../config/env.js';

const client = createClient({ url: config.REDIS_URL });

client.on('error', (error) => {
  console.error('Redis error:', error);
});

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

export async function storeRefreshToken(key: string, value: string, ttlSeconds = 60 * 60 * 24) {
  await connectRedis();
  await client.set(key, value, { EX: ttlSeconds });
}

export async function getRefreshToken(key: string) {
  await connectRedis();
  return client.get(key);
}

export async function revokeRefreshToken(key: string) {
  await connectRedis();
  await client.del(key);
}

export function buildRefreshTokenKey(userId: number) {
  return `refresh_token:${userId}`;
}
