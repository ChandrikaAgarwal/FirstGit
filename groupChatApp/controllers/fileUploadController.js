const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const User = require('../models/users');
const Group = require('../models/groups');
const Message = require('../models/messages');
const Groupmessage = require('../models/groupmessages')
const Usergroup = require('../models/userGroup');
function uploadToS3(file) {
    try {
        const BUCKET_NAME = process.env.BUCKET_NAME
        const IAM_USER_KEY = process.env.IAM_USER_KEY
        const IAM_USER_SECRET = process.env.IAM_ACCESS_KEY
        console.log("bucket: ", BUCKET_NAME);
        console.log("user key: ", IAM_USER_KEY);
        console.log("secret key: ", IAM_USER_SECRET);
        
        
        
        let s3Bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
        })
        var params = {
            Bucket: BUCKET_NAME,
            Key: `${uuidv4()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        }
        return new Promise((resolve, reject) => {
            s3Bucket.upload(params, (err, data) => { 
                if (err) {
                    console.log("something went wrong while uploading files to s3: ", err);
                    reject(err)
                } else {
                    console.log("file uploaded successfully to s3: ", data);
                    resolve(data.Location)
                }
            })
         })
    } catch (err) {
        console.log("error in uploading to s3: ", err);
        throw new Error("S3 Upload Failed: " + err.message);
    }
}

exports.uploadFiles = async (req, res) => {
    try {
        const files = req.files;
        const { groupId } = req.params
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "No user found" })
        }
        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "group not found" })
        }
        const usersofGrp = await Usergroup.findAll({
            where: {
                groupId: groupId
            }
        })
        const fileUrls=await Promise.all(files.map(file=>uploadToS3(file)))
        const messages = await Promise.all(fileUrls.map((url, i)=>
        group.createGroupmessage({
            name: user.name,
            message: url,
            userId:user.id
        })
        ))
        req.app.get('wss').clients.forEach(client => {
            if (client.readyState === require('ws').OPEN) {
                console.log("group client: ", client);
                console.log("client user id in group message: ", client.userId);
                if (usersofGrp.some(u => parseInt(u.userId) === client.userId)) {
                    console.log("entering if of websocket");
                    messages.forEach((msg) => {
                        client.send(JSON.stringify({
                            event: 'new-filemsg',
                            message: msg.message,
                            msgId: msg.id,
                            name: msg.name,
                            userId: msg.userId,
                            groupId: msg.groupId
                        }));
                    })
                }
            }
        });
        res.status(200).json({message:"Files uploaded successfully",urls:fileUrls,messages})
    } catch (err) {
        console.log("error in uploading files: ", err);
        res.status(500).json({message:"Error in uploading files",details:err})
    }
}