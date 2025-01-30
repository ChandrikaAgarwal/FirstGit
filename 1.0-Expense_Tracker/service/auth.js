const jwt=require('jsonwebtoken')
const secret='Chandu@123'
function setUser(user){
    return jwt.sign(user,secret)
}