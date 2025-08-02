const mongoose=require('mongoose')
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
    },
    createdPolls: [{
        type: mongoose.Types.ObjectId,
        ref:"Poll"
    }],
    votedPolls: [{
        type: mongoose.Types.ObjectId,
        ref: "Poll"
    }]
},{timestamps:true})

module.exports=mongoose.model("User",userSchema)