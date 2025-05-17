const express = require('express')
const payControl = require('../controllers/paymentController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.post("/", jwtAuthMiddleware, payControl.createPayment)
router.get("/check-status/:orderId", jwtAuthMiddleware, payControl.getPayment)
router.get("/:orderId", jwtAuthMiddleware, payControl.getPayment)

module.exports = router;