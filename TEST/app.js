const http=require('http')
const server=http.createServer((req,res)=>{
    if(req.url=='/'){
        res.end(`
            <h1>Hello from sharpener</h1>
            <h1>This is the home page</h1>
            <h1>This is page 1<h1>
            <h1>I love coding<h1>`)
    }
})

server.listen(3000,()=>{
    console.log("server is running");
    
})