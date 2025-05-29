require('dotenv').config()
const Sib = require('sib-api-v3-sdk')
const client=Sib.ApiClient.instance
const apiKey=client.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY
const tranEmailApi= new Sib.TransactionalEmailsApi()

async function sendInterestEmail({ sellerEmail, sellerName, buyerName, buyerId, bookId, bookTitle }) {
    try {
        const emailData = {
            sender: { name: 'ReadCycle', email: "chandrikaagarwal086@gmail.com" },
            to: [{ email: sellerEmail, name: sellerName }],
            subject: `New interest in your book: ${bookTitle}`,
            htmlContent: `  <p>Hi ${sellerName},</p>
        <p><strong>${buyerName}</strong> (User ID: ${buyerId}) is interested in your book:</p>
        <ul>
          <li><strong>Book:</strong> ${bookTitle}</li>
          <li><strong>Book ID:</strong> ${bookId}</li>
        </ul>
        <p>Login to chat with them or view the request.</p>
        <p>- ReadCycle Team</p>`
        }
        const result = await tranEmailApi.sendTransacEmail(emailData);
        console.log("result of brevo: ",result);
        
        console.log('Email sent via Brevo:', result.messageId);
        
    } catch (err) {
        console.error('Error sending email via Brevo:', err);
    }
}

module.exports={sendInterestEmail}