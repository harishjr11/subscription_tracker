// models/message.model.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true }, // renamed from chatId to chat
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], default: 'text' }, // added
  isSubscription: { type: Boolean, default: false }, // added
  metadata: { // optional fields for subscription screenshots
    serviceName: String,
    price: Number,
    rating: Number,
    comment: String,
  },
  timestamp: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  }
});

export default mongoose.model('Message', messageSchema);
