// routes/message.routes.js
import { Router } from 'express';
const router = Router();
import { sendMessage, getMessages, sendImage, markMessagesAsSeen } from '../controllers/message.controller.js';
import authorize from '../middlewares/auth.middleware.js';

router.post('/', authorize, sendMessage);
router.get('/:chatId', authorize, getMessages);
router.post('/send-image', authorize, sendImage);
router.put('/mark-seen/:chatId', authorize, markMessagesAsSeen);

export default router;
