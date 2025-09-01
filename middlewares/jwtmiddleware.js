const jwt=require('jsonwebtoken')

const jwtAuthMiddleware = (req, res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized:No token provided" });
    }
    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "invalid token" })
    }

}

const generateToken = (userData) => {
    return jwt.sign(
        { id: userData.id },
        process.env.JWT_SECRET
    );
}

module.exports = { jwtAuthMiddleware, generateToken };