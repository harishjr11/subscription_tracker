import mongoose, { Schema, model } from 'mongoose';

const ChatSchema = new Schema({
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String, trim: true },
  latestMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
}, { timestamps: true });

export default model('Chat', ChatSchema);
