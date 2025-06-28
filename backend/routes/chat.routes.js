// routes/chat.routes.js
import { Router } from 'express';
const router = Router();
import { createChat, getChats } from '../controllers/chat.controller.js';
import authorize from '../middlewares/auth.middleware.js';

router.post('/', authorize, createChat);
router.get('/', authorize, getChats);

export default router;
