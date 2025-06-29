import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 20,
    },
    
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: 6,
    },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // incoming
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],   // outgoing
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],


}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;