const User = require("../models/users")
const Book = require("../models/books")
const Message=require("../models/message")
const AWS = require('aws-sdk')
const {v4:uuidv4}=require('uuid')
const mongoose=require('mongoose')
const { sendInterestEmail } = require('../services/emailService')
const Interest=require('../models/book_interest')
const listingABook = async (req, res) => {
    try {
        const files = req.files;
        console.log("files:",files);
        
        const{title,author,subject,location,experience,price}=req.body
        const newBook = new Book({
            title,
            author,
            subject,
            location,
            status:"available",
            experience,
            price,
            sellerId:req.user.id
        })
        const fileUrls=await Promise.all(files.map(file=>uploadToS3(file)))
        newBook.bookImg = fileUrls
        await newBook.save()
        res.status(201).json({message:"Book listed successfully",newBook})
    } catch (err) {
        console.log("error in uploading book: ", err);
        res.status(500).json({ message: "Error in uploading book", details: err })
    }
}

function uploadToS3(file) {
    try {
        const BUCKET_NAME = process.env.BUCKET_NAME
        const IAM_USER_KEY = process.env.IAM_USER_KEY
        const IAM_ACCESS_KEY = process.env.IAM_ACCESS_KEY
        
        const s3bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_ACCESS_KEY,
            region:"ap-south-1"
        })

        var params = {
            Bucket: BUCKET_NAME,
            Key: `${uuidv4()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL:'public-read'
        }
        return new Promise((resolve, reject) => {
            s3bucket.upload(params, (err, data) => {
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
        console.log("error uploading to s3: ", err);
        throw new Error("s3 upload failed: " + err.message)
    }
}

const getListedBooks = async (req, res) => {
    try {
        const allBooks = await Book.find().populate('sellerId', 'name')       
        
        res.status(200).json({ message: "Listed Books: ", allBooks })
    } catch (err) {
        console.log("Error fetching all listed Books ", err);
        res.status(500).json({ message: "Error fetching all listed Books ", details: err })
    }
}

const getRequestedBook = async (req, res=null) => {
    try {
        const bookId=new mongoose.Types.ObjectId(req.params.bookId.trim())
        let userId = new mongoose.Types.ObjectId(req.user.id)
        let seller
        let buyer
        const requestedBook = await Book.findById(bookId).populate('sellerId','name')
        let isSeller = false
        console.log("requestedBook: ",requestedBook);
        
        if ( userId.equals(requestedBook.sellerId._id)) {
            isSeller=true
        }
        
        seller = await User.findById(requestedBook.sellerId._id)
        if(!isSeller){
            buyer=await User.findById(req.user.id).populate('_id','name')
        }
        let buyerSeller = [seller, buyer]
        console.log("buyerSeller: ", buyerSeller);
        
        // req.app.get('wss').clients.forEach(client => {
        //     if (client.readyState === require('ws').OPEN) {
        //         if (buyerSeller.some(u => parseInt(u._id) === client.userId)) {
        //             console.log("entering if of websocket");
        //             client.send(JSON.stringify({
        //                 event: 'buyer-msg',
        //                 message: message,
                        
        //             }))
        //         }
        //     }
        // })
        if (res) {
            return res.status(200).json({message:"Book Requested: ",requestedBook,isSeller})
        } else {
            return{requestedBook,buyer,seller}
        }
        
     } catch (err) {
        console.log("Error in fetching the requested Book ",err);
        res.status(500).json({ message:"Error in fetching the requested Book ",details:err})
    }
}

const bookInterest = async (req, res) => {
    try {
        const bookId = new mongoose.Types.ObjectId(req.params.bookId.trim())
        const desiredBook = await Book.findById(bookId).populate('sellerId', 'email name')
        const buyer = await User.findById(req.user.id)
        
        await sendInterestEmail({
            sellerEmail: desiredBook.sellerId.email,
            sellerName: desiredBook.sellerId.name,
            buyerName: buyer.name,
            buyerId: buyer._id,
            bookId: desiredBook._id,
            bookTitle:desiredBook.title
        })

        const newInterest = new Interest({
            sellerEmail: desiredBook.sellerId.email,
            sellerName: desiredBook.sellerId.name,
            sellerId: desiredBook.sellerId,
            buyerName: buyer.name,
            buyerId: buyer._id,
            bookId: desiredBook._id,
            bookTitle: desiredBook.title
        })
        await newInterest.save()
        return res.status(200).json({message:"Seller has been notified"})
    } catch (err) {
        console.error("Error sending email to seller", err)
        return res.status(500).json({ message: " Error in notifying seller ",details:err })
        
    }
}
const messageRecieved = async (req, res) => {
    try {
        let { message, recieverId, bookId,bookName } = req.body
        recieverId = new mongoose.Types.ObjectId(recieverId)
        let reciever = await User.findById(recieverId)
        console.log("reciever: ",reciever);
        
        let senderId = new mongoose.Types.ObjectId(req.user.id)
        let sender = await User.findById(senderId)
        const newMsg = new Message({
            recieverId,
            recieverName: reciever.name,
            senderId,
            senderName: sender.name,
            message,
            bookId,
            bookName
        })
        await newMsg.save()
        let buyerSellerInfo=[recieverId,senderId]
        res.app.get('wss').clients.forEach(client => {
            if (client.readyState === require('ws').OPEN) { 
                console.log("Entering if of websocket")
                if (buyerSellerInfo.some(u => String(u) === String(client.userId))) {
                    console.log("checking buyer id and client id");
                    
                    client.send(JSON.stringify({
                        event: 'new-msg',
                        message: message,
                        msgId: newMsg._id,
                        senderId: senderId,
                        recieverId:recieverId,
                        recieverName: newMsg.recieverName,
                        senderName:newMsg.senderName,
                        bookName: newMsg.bookName,
                        bookId: newMsg.bookId,
                    }))
                    
                }
                
            }
        });
       res.status(200).json({message:"Message recieved:",newMsg})
    } catch (err) {
        console.log("Error in messageRecieved : ",err);
        res.status(500).json({ message: " Error in Message recieved:",details:err })
    }
}

const getListedBooksByUser = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const allListedBooks = await Book.find({
            sellerId:userId,
        }).populate('sellerId', 'email name')
        const allinterestedBooks = await Interest.find({
            buyerId:userId
        }).populate('bookId','bookImg price')
        return res.status(200).json({message:"Books listed by the seller: ",allListedBooks,allinterestedBooks})
    } catch (err) {
        console.log("Error in getting all seller books: ", err);
        return res.status(500).json({ message:"Error in getting all seller books", details:err})
        
    }
}
const getChatList = async (req, res) => {
    try {
        const bookId = new mongoose.Types.ObjectId(req.params.bookId.trim())
        console.log("bookId: ",bookId);
        let list;
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const user = await User.findById(userId)
        const book = await Book.findById(bookId)
        let isSeller=false
        // let list=await Interest.find({bookId:bookId})
        
        
        if (book.sellerId.equals(userId)) {
            isSeller = true
        } 
        if (isSeller) {
         list = await Interest.find({ bookId: bookId })
        } else {
            list = await Interest.findOne({
                buyerId: userId,
                bookId
            })
        }
        console.log("list: ", list);
        return res.status(200).json({message:"Your list has arrived: ",list,isSeller})
    } catch (err) {
        console.log("Error in getting your chat list: ", err);
        return res.status(500).json({ message: "Error in getting your chat list", details: err })
    }
}

const getMyChats = async (req, res) => {
    try {
        const bookId = new mongoose.Types.ObjectId(req.params.bookId.trim())
        const reciever = new mongoose.Types.ObjectId(req.query.recieverId.trim())
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const mychats = await Message.find({
            $or: [
                { senderId: userId,recieverId:reciever },
                { recieverId: userId,senderId:reciever}
            ],
            bookId:bookId
        })
        return res.status(200).json({message:"Your chats ",mychats,userId})
     } catch (err) {
        console.log("Error getting your chats: ", err);
        return res.status(500).json({ message:"Error getting your chats ",details:err})
        
    }
}
module.exports = {
    listingABook,
    getListedBooks,
    getRequestedBook,
    bookInterest,
    getListedBooksByUser,
    getChatList,
    messageRecieved,
    getMyChats
}

