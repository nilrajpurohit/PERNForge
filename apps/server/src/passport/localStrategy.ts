import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { validateUser } from '../services/auth.service.js';

passport.use(
  new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
      const user = await validateUser(email, password);
      return user ? done(null, user) : done(null, false, { message: 'Invalid credentials' });
    } catch (error) {
      return done(error as Error);
    }
  })
);
