import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRE } from "../config/env.js";

export const signUp = async (req, res, next) => {
    //Implement the sign up functionality
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        //Implement the sign up functionality

        const {name, email, password} = req.body;

        //check user alreasdy exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        //hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        


        // const newUsers = await new User({
        //     name, email, password: hashedPassword
        // }.save({ session }));

                // Create new user
                const newUsers = new User({
                    name,
                    email,
                    password: hashedPassword
                });
        
                await newUsers.save({ session });

        const token = jwt.sign({ userId: newUsers._id}, JWT_SECRET, { expiresIn: JWT_EXPIRE });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ success:true,
            message: 'User created successfully',
            data: { token, User: newUsers }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    //Implement the sign in functionality
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({email});

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
        
        res.status(200).json({ success: true, message: 'User logged in successfully', data: { token, user } });

    } catch (error) {
        next(error);
    }
}

export const signOut = async (req, res, next) => {
    try {
        // Since JWT is stateless, we can't "delete" the token from the server
        // Instead, we instruct the client to remove it
        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};


export const getMe = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};