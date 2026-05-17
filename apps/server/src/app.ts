import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import './passport/localStrategy.js';
import './passport/jwtStrategy.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: config.NODE_ENV || 'development' });
});

export default app;
