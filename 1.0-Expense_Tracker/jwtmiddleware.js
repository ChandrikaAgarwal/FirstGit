const jwt = require('jsonwebtoken')

const jwtAuthMiddleware = (req, res, next) => {  //to figure out who the user is
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    console.log("Received Token: ", token); // Debugging step
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    try {
        //verify jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) //decryptiion
        // on decryption we will get the user object(payload) that is being encrypted by this token

        //attach user info to the request object
        req.user = decoded
        next()

    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' })

    }
}

//function to generate jwt token

const generateToken = userData => { //call this when the user has successfully logged in
    //Generate new jwt token using user data
    //  return jwt.sign(userData, process.env.JWT_SECRET)
    return jwt.sign(
        { id: userData.id }, // 🛠 Add phone number
        process.env.JWT_SECRET
    );
}


module.exports = { jwtAuthMiddleware, generateToken };