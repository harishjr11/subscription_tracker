import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if(!DB_URI){
    throw new Error("Please provide a valid database URI in the env files");
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI);

        console.log(`Connected to DB in ${NODE_ENV} mode`);
    } catch (error) {
        console.log('Error connecting to DB : ', error);
        process.exit(1);
    }
}

export { connectToDatabase };