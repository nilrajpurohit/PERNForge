import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { findUserByEmail, findUserById } from './user.service.js';
import { buildRefreshTokenKey, getRefreshToken, revokeRefreshToken, storeRefreshToken } from './redis.service.js';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function validateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

export function createTokens(userId: number) {
  const payload = { sub: userId };
  const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export async function storeUserRefreshToken(userId: number, refreshToken: string) {
  const key = buildRefreshTokenKey(userId);
  await storeRefreshToken(key, refreshToken, 60 * 60 * 24 * 7);
}

export async function validateRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as unknown as { sub: number | string };
    const sub = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;
    if (Number.isNaN(sub)) return null;
    const key = buildRefreshTokenKey(sub);
    const stored = await getRefreshToken(key);
    if (stored !== token) return null;
    return await findUserById(sub);
  } catch {
    return null;
  }
}

export async function revokeTokensForUser(userId: number) {
  const key = buildRefreshTokenKey(userId);
  await revokeRefreshToken(key);
}
