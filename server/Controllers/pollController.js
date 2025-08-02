const Poll = require('../models/Poll');

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

module.exports = {
    createPoll
}