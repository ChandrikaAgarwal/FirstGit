const Poll = require('../Models/Poll')
const router = require('../Routes/authRoute');

const createPoll = async (req, res) => {
    try {
        const { question, options, expiresAt } = req.body
        const newPoll = new Poll({
            question,
            options: options.map(text => ({ text })),
            createdBy: req.user.id,
            expiresAt
        })
        await newPoll.save();
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
module.exports = {
    createPoll,
    getAllPolls
}