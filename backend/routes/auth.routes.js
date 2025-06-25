import { Router } from 'express';
import { signIn, signOut, signUp, getMe } from '../controllers/auth.controller.js';
import authorize from '../middlewares/auth.middleware.js';

const authRouter = Router();


// The authRouter object is an instance of the Express Router class.
// Path: /api/v1/auth/sign-up
authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.get("/me", authorize, getMe);

export default authRouter;