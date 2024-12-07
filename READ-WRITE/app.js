const http=require('http')
const routes=require('./routes')
const server=http.createServer(routes)

server.listen(5000,()=>{
    console.log("server is running");
    
})