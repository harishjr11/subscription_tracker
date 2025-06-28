import { Schema, model } from 'mongoose';

const ChatSchema = new Schema({
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String, trim: true },
}, { timestamps: true });

export default model('Chat', ChatSchema);

// This schema defines a chat model with fields for members, group status, and name.