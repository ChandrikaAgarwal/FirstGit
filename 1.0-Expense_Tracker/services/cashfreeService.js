const { Cashfree } = require('cashfree-pg')
console.log("loading cashfree.js");
const api_url = "http://15.206.27.247"

const clientId = process.env.CASHFREE_API_ID;
const secretKey = process.env.CASHFREE_SECRET_KEY;
console.log(clientId, secretKey); // Debugging ke liye


Cashfree.XClientId = process.env.CASHFREE_API_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Sandbox mode ke liye



exports.createOrder = async (
    orderId,
    orderAmount = 2000,
    orderCurrency = "INR",
    customerID,
    customerPhone,
    customerEmail,
) => {
    try {
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
        const formattedExpiryDate = expiryDate.toISOString();

        const request = {
            order_amount: orderAmount,
            order_currency: orderCurrency,
            order_id: orderId,
            customer_details: {
                customer_id: String(customerID),
                customer_phone: customerPhone,
                customer_email: customerEmail,
            },
            order_meta: {
                return_url: `http://localhost:5000/create-payment/?orderId=${orderId}`,
                payment_methods: "cc,dc,upi"
            },
            order_expiry_time: formattedExpiryDate  //optional
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        console.log("response from cashfreeService.js: ", response);
        console.log("sessionId in createOrder:: ", response.data.payment_session_id);

        return response.data.payment_session_id;
    } catch (err) {
        console.log("error in order: ", err);

        console.error("Error creating order: ", err.message)
    }
};

exports.getPaymentStatus = async (orderId) => {
    try {
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        console.log("order placed successfully: ", response);

        let getOrderResponse = response.data
        let orderStatus;


        console.log("getOrderResponse:  ", getOrderResponse);

        if (getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
            orderStatus = "SUCCESS";
        } else if (getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
            orderStatus = "PENDING";
        } else {
            orderStatus = "FAILURE";
        }

        console.log(`Order ${orderId} status updated to: ${orderStatus}`);
        return orderStatus;
    } catch (error) {
        console.log("error in getPayment: ", error);

        console.error("Error fetching order status: ", error.message);
    }
}