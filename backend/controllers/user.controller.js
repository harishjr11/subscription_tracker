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