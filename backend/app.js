import express from 'express';
import { PORT, NODE_ENV } from './config/env.js';
import { connectToDatabase } from './database/mongodb.js';
import cors from 'cors';

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscriptions.routes.js';
import errorMidddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arject.middleware.js';
import workflowRouter from './routes/workflow.routes.js';

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMidddleware);

app.get('/', (req, res) => {
    res.send('Sub Guard is working dawggg');
})

app.listen(PORT, async () => {
    console.log(`bro running in http://localhost:${PORT}/`);

    await connectToDatabase();
})

// import bcrypt from "bcryptjs";
// const hashed = await bcrypt.hash("harish", 10);
// console.log(hashed);

export default app;