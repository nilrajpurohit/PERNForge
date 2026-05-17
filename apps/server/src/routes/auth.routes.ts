import express from 'express';
import passport from 'passport';
import { loginController, logoutController, refreshController, registerController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
router.post('/logout', passport.authenticate('jwt', { session: false }), logoutController);

export default router;
