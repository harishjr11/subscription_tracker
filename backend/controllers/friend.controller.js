import User from "../models/user.model.js";


export const placeholder = async (req, res, next) => {
    try{
        res.send({title : 'Placeholder for friend routes'});
    } catch (error){
        next(error);
    }
}

export const getFriends= async (req, res, next) => {
    try {
          const user = await User.findById(req.user._id)
            .populate('friends', 'name email')
            .populate('friendRequests', 'name email')
            .populate('sentRequests', 'name email')
            .populate('blocked', 'name email');

        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({
            friends: user.friends,
            incomingRequests: user.friendRequests,
            sentRequests: user.sentRequests,
            blockedUsers: user.blocked,
        });

    } catch (error) {
        next(error);
    }
}


export const sendFrndRequest = async (req, res, next) => {
    try {
         const senderId = req.user._id;
        const receiverId = req.params.id;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ msg: 'You cannot send a friend request to yourself' });
        }
            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);
            //console.log(sender, receiver);
            if (!receiver) return res.status(404).json({ msg: 'User not found' });
            if (receiver.friendRequests.includes(senderId) || receiver.friends.includes(senderId))
                return res.status(400).json({ msg: 'Already requested or already friends' });

            receiver.friendRequests.push(senderId);
            sender.sentRequests.push(receiverId);

            await receiver.save();
            await sender.save();

            res.json({ msg: 'Friend request sent' });

    } catch (error) {
        next(error);
    }
}

export const acceptFrndRequest = async (req, res, next) => {
    try {
        const receiverId = req.user._id;
        const senderId = req.params.id;

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver.friendRequests.includes(senderId)) {
            return res.status(400).json({ msg: 'No request from this user' });
        }

        // Remove from requests
        receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());

        // Add to friends
        receiver.friends.push(senderId);
        sender.friends.push(receiverId);

        await receiver.save();
        await sender.save();

        res.json({ msg: 'Friend request accepted' });
    } catch (error) {
        next(error);
    }
}

export const rejectFrndRequest = async (req, res, next) => {
    try{
        const receiverId = req.user._id;
        const senderId = req.params.id;

        const receiver = await User.findById(receiverId);
        const senderr = await User.findById(senderId);

        receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
        senderr.sentRequests = senderr.sentRequests.filter(id => id.toString() !== receiverId);

        await receiver.save();
        await senderr.save();

        res.status(200).json({ success: true, message: 'Friend request rejected' });
    }catch (error) {
        next(error);
    }
}


export const cancelFrndRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if it's in sentRequests
    const hasSent = user.sentRequests.some(id => id.toString() === targetId);
    if (!hasSent) {
      return res.status(400).json({ success: false, message: 'No pending request to cancel' });
    }

    // Remove references
    user.sentRequests = user.sentRequests.filter(id => id.toString() !== targetId);
    target.friendRequests = target.friendRequests.filter(id => id.toString() !== userId.toString());

    await user.save();
    await target.save();

    res.status(200).json({ success: true, message: 'Friend request canceled' });
  } catch (err) {
    next(err);
  }
};



export const deleteFrnd = async (req, res, next) => {
    try{

        const userId = req.user._id;
        const friendId = req.params.id;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        user.sentRequests = user.sentRequests.filter(id => id.toString() !== friendId);
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);

        friend.sentRequests = friend.sentRequests.filter(id => id.toString() !== userId);
        friend.friendRequests = friend.friendRequests.filter(id => id.toString() !== userId);


        await user.save();
        await friend.save();

        res.status(200).json({ success: true, message: 'Friend removed successfully'});
    } catch (error){
        next(error);
    }
}


export const getRelationshipStatus = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(200).json({ status: 'self' });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!target) {
      return res.status(404).json({ status: 'none', message: 'User not found' });
    }

    if (user.blocked.includes(targetId)) {
      return res.status(200).json({ status: 'blocked' });
    }

    if (target.blocked.includes(userId)) {
      return res.status(200).json({ status: 'blocked_by' });
    }

    if (user.friends.includes(targetId)) {
      return res.status(200).json({ status: 'friend' });
    }

    if (user.sentRequests.includes(targetId)) {
      return res.status(200).json({ status: 'sent' });
    }

    if (user.friendRequests.includes(targetId)) {
      return res.status(200).json({ status: 'incoming' });
    }

    return res.status(200).json({ status: 'none' });

  } catch (err) {
    next(err);
  }
};



//------------------------------------------------------------------------------------------------------//
//-------------------------------------------BLOCKING SYSTEM--------------------------------------------//
//------------------------------------------------------------------------------------------------------//

export const blockUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.id;

    if (userId.toString() === targetId) {
      return res.status(400).json({ success: false, message: "You can't block yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.blocked.includes(targetId)) {
      user.blocked.push(targetId);
    }

    // Optional: auto unfriend
    user.friends = user.friends.filter(id => id.toString() !== targetId);
    target.friends = target.friends.filter(id => id.toString() !== userId.toString());

    // Optional: remove pending requests
    user.sentRequests = user.sentRequests.filter(id => id.toString() !== targetId);
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== targetId);
    target.sentRequests = target.sentRequests.filter(id => id.toString() !== userId);
    target.friendRequests = target.friendRequests.filter(id => id.toString() !== userId);

    await user.save();
    await target.save();

    res.status(200).json({ success: true, message: 'User blocked' });
  } catch (err) {
    next(err);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.blocked = user.blocked.filter(id => id.toString() !== targetId);
    await user.save();

    res.status(200).json({ success: true, message: 'User unblocked' });
  } catch (err) {
    next(err);
  }
};
