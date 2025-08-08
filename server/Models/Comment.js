const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        poll: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, 
    },
    { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
