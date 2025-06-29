// socket/socket.js - FIXED VERSION
import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';

// Store user socket mappings
const userSockets = new Map(); // userId -> Set of socketIds

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Store user-socket mapping when they identify themselves
    socket.on('user_connected', (userId) => {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });
    
    socket.on('join', (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    socket.on('leave', (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left room ${chatId}`);
    });

    socket.on('send_message', async ({ sender, chatId, type = 'text', content, metadata }) => {
      if (!sender || !chatId || !content) {
        console.error('Missing fields in message');
        return;
      }

      try {
        // 1. Save the message
        const newMessage = await Message.create({
          sender,
          chatId,
          type,
          content,
          metadata,
          status: 'delivered',
          isSeen: false
        });

        // 2. Update latest message in chat
        await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

        // 3. Get the fully populated chat
        const updatedChat = await Chat.findById(chatId)
          .populate('members', '-password')
          .populate({
            path: 'latestMessage',
            populate: { path: 'sender', select: 'name email' }
          });

        // 4. Emit to chat area (room-based)
        socket.to(chatId).emit('receive_message', {
          _id: newMessage._id,
          sender: sender,
          from: sender,
          type,
          content,
          metadata,
          timestamp: newMessage.timestamp,
          status: newMessage.status,
          isSeen: false,
          chatId,
        });

        console.log('📡 Emitted receive_message to room:', chatId);

        // 5. ✅ FIXED: Emit to each member's personal sockets for sidebar updates
        const otherMembers = updatedChat.members?.filter(
          m => m._id.toString() !== newMessage.sender.toString()
        );

        for (const member of otherMembers) {
          const unseenCount = await Message.countDocuments({
            chatId: newMessage.chatId,
            isSeen: false,
            sender: { $ne: member._id }
          });

          // ✅ Emit to user's personal sockets instead of room
          const memberSocketIds = userSockets.get(member._id.toString());
          if (memberSocketIds) {
            memberSocketIds.forEach(socketId => {
              io.to(socketId).emit("new_message", {
                updatedChat,
                unseenCount,
                forUser: member._id.toString()
              });
            });
            console.log("📬 Sent new_message to", member._id.toString(), "sockets:", Array.from(memberSocketIds));
          }
        }

      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('typing', ({ chatId, senderId }) => {
      socket.to(chatId).emit('typing', { chatId, senderId });
    });

    socket.on('stop_typing', ({ chatId, senderId }) => {
      socket.to(chatId).emit('stop_typing', { chatId, senderId });
    });

    socket.on('mark_seen', async ({ chatId, userId }) => {
      try {
        const result = await Message.updateMany(
          { 
            chatId, 
            sender: { $ne: userId }, 
            isSeen: false 
          },
          { $set: { isSeen: true } }
        );

        console.log(`Marked ${result.modifiedCount} messages as seen in chat ${chatId} by user ${userId}`);

        io.to(chatId).emit('messages_seen', { 
          chatId, 
          seenBy: userId,
          count: result.modifiedCount
        });

      } catch (err) {
        console.error("Error marking messages as seen:", err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up user-socket mapping
      for (const [userId, socketIds] of userSockets.entries()) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
};