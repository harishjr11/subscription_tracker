import Chat from '../models/chat.model.js'; // ✅ correct way
import Message from '../models/message.model.js'; // ✅ correct way

export async function createChat(req, res) {
  const { userId } = req.body;

  if (!userId) return res.status(400).send("UserId param not sent");

  try {
    let chat = await Chat.findOne({
      members: { $all: [req.user._id, userId], $size: 2 },
      isGroup: false
    });

    if (chat) return res.json(chat);

    chat = await Chat.create({
      members: [req.user._id, userId],
      isGroup: false,
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).send("Server error");
  }
}

export async function getChats(req, res) {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate('members', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name email' }
      })
      .sort({ updatedAt: -1 });

    // 🧠 For each chat, calculate unseen message count
    const chatsWithUnseen = await Promise.all(
      chats.map(async (chat) => {
        const unseenCount = await Message.countDocuments({
          chatId: chat._id,
          isSeen: false,
          sender: { $ne: req.user._id } // not sent by current user
        });

        // Add unseenCount to the chat object (to be sent to frontend)
        const chatObj = chat.toObject();
        chatObj.unseenCount = unseenCount;
        return chatObj;
      })
    );

    res.json(chatsWithUnseen);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).send("Server error");
  }
}



