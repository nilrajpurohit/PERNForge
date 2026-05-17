import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { config } from '../config/env.js';
import { findUserById } from '../services/user.service.js';

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await findUserById(payload.sub as number);
        return user ? done(null, user) : done(null, false);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);
