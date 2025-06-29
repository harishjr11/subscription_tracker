import User from "../models/user.model.js";


export const getUsers= async (req, res, next) => {
    try {
        const users = await User.find(req.params.id).select('-password');

        res.status(200).json({ success: true, message: 'List of all users', data: users });
    } catch (error) {
        next(error);
    }
}


export const getUser= async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({username: user.name});

        // res.status(200).json({ success: true, message: 'User Details', data: user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

export const searchUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const currentUser = await User.findById(userId);

    const excludedIds = [
      ...currentUser.friends,
      ...currentUser.sentRequests,
      ...currentUser.friendRequests,
      ...currentUser.blocked,
      userId // exclude self
    ].map(id => id.toString());

    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ]
        },
        {
          _id: { $nin: excludedIds }
        }
      ]
    }).select('name email _id');

    res.status(200).json({ success: true, users });

  }  catch (err) {
  console.error('[searchUsers ERROR]', err);
  //res.status(500).json({ success: false, error: 'Server error', message: err.message });
    next(err);
}


};



