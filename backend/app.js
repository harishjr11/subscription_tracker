import express from 'express';
import { PORT, NODE_ENV } from './config/env.js';
import { connectToDatabase } from './database/mongodb.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscriptions.routes.js';
import errorMidddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arject.middleware.js';
import workflowRouter from './routes/workflow.routes.js';
import chatRouter from './routes/chat.routes.js';
import messageRouter from './routes/message.routes.js';
import { socketHandler } from './socket/socket.js';
import friendRouter from './routes/friend.routes.js';

const app = express();

app.use(cors({
  origin: 'https://social-subscription-tracker.vercel.app',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/friends', friendRouter)

app.use(errorMidddleware);

app.get('/', (req, res) => {
    res.send('Sub Guard is working dawggg');
})

const server = http.createServer(app);
//const io = new Server(server, { cors: { origin: '*' } });

const io = new Server(server, {
  cors: {
    origin: 'https://social-subscription-tracker.vercel.app',
    methods: ['GET', 'POST','DELETE', 'PUT','PATCH'],
    credentials: true
  }
});
socketHandler(io);


server.listen(PORT, async () => {
    console.log(`bro running in ${PORT}/`);

    await connectToDatabase();
})

export default app;