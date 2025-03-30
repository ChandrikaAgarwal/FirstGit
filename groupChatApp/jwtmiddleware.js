const jwt = require('jsonwebtoken')

const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({error: "Unauthorized, no header found"})
    }
    const token = authHeader.split(' ')[1]
    console.log("received token: ",token);
    if (!token) return res.status(401).json({ error: "Unauthorized no token provided" })
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next()
    } catch (err) {
        console.log("Jwt error: ",err)
        return res.status(401).json({ error: "Unauthorized, invalid token" })
    }
}

const generateToken = (userData) => {
    return jwt.sign({ id: userData.id, email: userData.email, phone: userData.phone, password: userData.password }, process.env.SECRET_KEY);
}

module.exports={jwtAuthMiddleware,generateToken}