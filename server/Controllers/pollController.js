const { default: mongoose } = require('mongoose')
const Poll = require('../Models/Poll')
const User=require('../Models/Users')
const createPoll = async (req, res) => {
    try {
        const { question, options, expiresAt } = req.body
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const newPoll = new Poll({
            question,
            options: options.map(text => ({ text })),
            createdBy: req.user.id,
            expiresAt
        })
        await newPoll.save();
        const user=await User.findById(userId)
        user.createdPolls.push(newPoll._id)
        await user.save()
        return res.status(201).json({message:"New poll created ", newPoll });
    } catch (err) {
        console.log("Error creating a poll: ",err);
        return res.status(500).json({ message: 'Something went wrong. Please try again!', details: err })
    }
}

const getAllPolls = async (req, res, next) => {
    try {
        const polls = await Poll.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
        return res.status(200).json({ message: "Fetching all polls", polls });
    } catch (err) {
        console.log("Error Fetching all polls: ",err);
        res.status(500).json({ message: 'Failed to fetch polls',details:err });
    }

}

const votePoll = async (req, res,next) => {
    const { optionIndex } = req.body
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const pollId = new mongoose.Types.ObjectId(req.body.pollId)
    const user = await User.findById(userId)
    try {
        const poll = await Poll.findById(pollId)
        if (!poll) return res.status(404).json({ message: "Poll not found" })
        
        let votedPolls=user.votedPolls
        if (votedPolls.map(id => id.toString()).includes(pollId.toString())) {
            return res.status(400).json({message:"You have already voted"})
        }
        poll.options[optionIndex].votes += 1
        user.votedPolls.push(pollId)
        await poll.save()
        await user.save()

        const io = req.app.get('io');
        io.emit('pollUpdated', poll);
        res.status(200).json({ message: "Vote was casted", poll });
    } catch (err) {
        console.log("Error casting a vote: ", err);
        res.status(500).json({error:"Something went wrong. Please try again! ",details:err})
    }
}
module.exports = {
    createPoll,
    getAllPolls,
    votePoll
}