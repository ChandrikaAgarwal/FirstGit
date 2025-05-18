const mongoose=require('mongoose')
const Schema = mongoose.Schema
const FileUrlSchema = new Schema({
    url: {
        type: String,
        required:true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

})


module.exports = mongoose.model('fileUrl',FileUrlSchema);
