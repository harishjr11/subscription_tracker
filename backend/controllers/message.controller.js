import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';

export async function sendMessage(req, res) {
  const { chatId, content } = req.body;

  if (!content || !chatId) return res.status(400).send("Missing content/chatId");

  const message = await Message.create({
    chatId,
    sender: req.user._id,
    content,
  });

  await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });

  res.status(201).json(message);
}

export async function getMessages(req, res) {
  const { chatId } = req.params;
  const currentUserId = req.user._id;

  try {
    // Step 1: Mark all messages as seen that are not sent by the current user
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: currentUserId },
        seen: false
      },
      { $set: { seen: true } }
    );

    // Step 2: Fetch all messages
    const messages = await Message.find({ chatId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error in getMessages:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}

export async function sendImage(req, res) {
   try {
    console.log("📨 send-image route hit!");
  console.log(req.body);

    const { chatId, sender, image, metadata, isSubscription } = req.body;

    if (!chatId || !sender || !image) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create message
    const newMessage = new Message({
      chatId,
      sender,
      type: 'image',
      content: image, // base64 string
      isSubscription: isSubscription || false,
      metadata: metadata || {},
    });

    await newMessage.save();

    // Push message to chat
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: newMessage._id },
      lastMessage: newMessage._id,
    });

    // Emit to chat via socket.io (optional, if you use sockets)
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('receive_message', {
        from: sender,
        content: image,
        timestamp: new Date(),
        type: 'image',
        isSubscription: true,
        metadata,
      });
    }

    res.status(200).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


