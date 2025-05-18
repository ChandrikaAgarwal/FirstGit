const { createOrder, getPaymentStatus } = require("../services/cashfreeService")
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/orders')
const User = require('../models/user')
const mongoose=require('mongoose')
exports.createPayment = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { amount, currency, order_id } = req.body;
        console.log("User fron jwt: ", user);

        const { id, email, phone } = user

        const orderId = uuidv4();
        console.log("User : ", id, email, phone);
        // const orderStatus = await getPaymentStatus(orderId);
        const paymentSessionId = await createOrder(orderId, 2000, "INR", id, phone, email)

        if (paymentSessionId) {
            const newOrder=new Order({
                order_id: orderId,
                customer_email: email,
                order_status: "PENDING",
                userId:req.user.id
            })
            await newOrder.save()
        }
        res.json({
            paymentSessionId, orderId
        });


    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ message: "Payment creation failed" });
    }
}

exports.getPayment = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        console.log("UserDetails: ", user);

        const {orderId } = req.params
        const ordertoupdate = await Order.findOne({
           
            userId: req.user.id,
            order_id: { $eq: orderId }
            
            // order: [["id", "DESC"]]
        }).sort({_id:-1}).exec()
        if (!ordertoupdate) {
            console.log("Order not found in database:", orderId);
            return res.status(404).json({ message: "Order not found in database" });
        }
        console.log("order to update: ", ordertoupdate);

        const orderStatus = await getPaymentStatus(orderId);
        console.log("order Status: ", orderStatus);
        ordertoupdate.order_status = orderStatus
        await ordertoupdate.save()
        if (orderStatus === "SUCCESS") {
            user.premium = true
            user.save()
        }

        res.status(200).json({ orderId, orderStatus })
    } catch (err) {
        console.error("Error getting payment status:", err);
        res.status(500).json({ message: "Failed to get payment status" });
    }
}
