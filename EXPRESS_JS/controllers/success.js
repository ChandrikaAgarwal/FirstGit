const path=require('path')
const rootDir=require('../util/path')
exports.successController=(req,res,next)=>{
    res.sendFile(path.join(rootDir,'Views','form_submit.html'))
}
