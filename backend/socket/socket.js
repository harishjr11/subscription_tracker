// socket/socket.js
import Message from '../models/message.model.js';

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

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

  const newMessage = await Message.create({
    sender,
    chatId,
    type,
    content, // here
    metadata,
    status: 'delivered',
  });

  socket.to(chatId).emit('receive_message', {
    from: sender,
    type,
    content,
    metadata,
    timestamp: newMessage.timestamp,
    status: newMessage.status,
    _id: newMessage._id,
    chatId,
  });
});


 socket.on('typing', ({ chatId, senderId }) => {
  socket.to(chatId).emit('show_typing',{ chatId, senderId });
});

socket.on('stop_typing', ({ chatId, senderId }) => {
  socket.to(chatId).emit('hide_typing',{ chatId, senderId });
});

socket.on('mark_seen', async ({ chatId, userId }) => {
  try {
    // Update all messages where receiver is this user and not seen
    await Message.updateMany(
      { chatId, sender: { $ne: userId }, seen: false },
      { $set: { seen: true } }
    );

    // Optionally notify sender that messages were seen
    io.to(chatId).emit('messages_seen', { chatId, seenBy: userId });
  } catch (err) {
    console.error("Error marking messages as seen:", err);
  }
});


    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
