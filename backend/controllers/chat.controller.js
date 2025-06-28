import Chat from '../models/chat.model.js'; // ✅ correct way

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
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).send("Server error");
  }
}
