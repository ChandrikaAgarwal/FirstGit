const { default: mongoose } = require('mongoose');
const Comment = require('../Models/Comment');
const User = require('../Models/Users');

exports.addComment = async (req, res) => {
    try {
        const { text, pollId, parent } = req.body;
        let userId = req.user.id;
        userId=new mongoose.Types.ObjectId(userId)
        let user=await User.findById(userId)
        const newComment = new Comment({
            poll: pollId,
            user: userId,
            text,
            parent: parent || null,
        });

        const saved = await newComment.save();
        await saved.populate('user', 'username profilePicture');
        console.log("saved: ",saved);
        
        // Emit to clients via Socket.IO
        const io = req.app.get('io');
        io.to(pollId).emit('new-comment', saved.poll, saved.text,saved.user);

        res.status(201).json(saved);
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCommentsForPoll = async (req, res) => {
    try {
        const comments = await Comment.find({ poll: req.params.pollId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
