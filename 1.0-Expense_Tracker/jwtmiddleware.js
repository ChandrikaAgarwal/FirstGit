const jwt=require('jsonwebtoken')

const jwtAuthMiddleware=(req,res,next)=>{
    const token=req.headers.authorization.split(' ')[1]
    // const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    console.log("Received Token: ", token); // Debugging step
    if(!token) return res.status(401).json({error:'Unauthorized'})
    
    try{
      //verify jwt token
      const decoded=jwt.verify(token, process.env.JWT_SECRET)

      req.user=decoded
      next()

    }catch(err){
        console.error(err.message);
        res.status(401).json({error:'Invalid token'})
        
    } 
}

//function to generate jwt token

const generateToken=(userData)=>{
    //Generate new jwt token using user data
     return jwt.sign(userData, process.env.JWT_SECRET)
}


module.exports={jwtAuthMiddleware,generateToken};