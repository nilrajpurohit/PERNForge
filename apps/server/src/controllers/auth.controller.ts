import { Request, Response } from 'express';
import passport from 'passport';
import { createTokens, revokeTokensForUser, storeUserRefreshToken, validateRefreshToken } from '../services/auth.service.js';
import { createUser, findUserByEmail } from '../services/user.service.js';

export async function registerController(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const user = await createUser({ name, email, password });
  const tokens = createTokens(user.id);
  await storeUserRefreshToken(user.id, tokens.refreshToken);

  res.json(tokens);
}

export async function loginController(req: Request, res: Response) {
  return passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err || !user) {
      return res.status(401).json({ message: info?.message || 'Invalid login' });
    }

    const tokens = createTokens(user.id);
    await storeUserRefreshToken(user.id, tokens.refreshToken);
    res.json(tokens);
  })(req, res);
}

export async function refreshController(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }

  const user = await validateRefreshToken(refreshToken);
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const tokens = createTokens(user.id);
  await storeUserRefreshToken(user.id, tokens.refreshToken);
  res.json(tokens);
}

export async function logoutController(req: Request, res: Response) {
  const user = req.user as { id: number } | undefined;
  if (user?.id) {
    await revokeTokensForUser(user.id);
  }
  res.sendStatus(204);
}
