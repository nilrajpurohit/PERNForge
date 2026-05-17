import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signJwt(payload: object, options?: jwt.SignOptions) {
  return jwt.sign(payload, config.JWT_SECRET, { algorithm: 'HS256', ...options });
}

export function verifyJwt<T>(token: string) {
  return jwt.verify(token, config.JWT_SECRET) as T;
}
