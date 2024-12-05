const http=require('http')
const server=http.createServer((req,res)=>{ //for initializing a server
    console.log("Server is created");

    res.setHeader('Content-type','text/html') //we want to send back html content
    // we will make our server give different msgs based on the url client has asked for
    res.statusCode=200 //ok
    if (req.url=='/'){
        res.end("<h1>Hello World</h1>")
    }else{
        if(req.url=='/pizza'){
            res.statusCode=200
            res.end("<h1>This is your pizza</h1>")
        }else{
            res.statusCode=404;
            res.end("<h1>Page not Found</h1>")
        }
    }
    
})

let port=3000;
server.listen(port,()=>{
    console.log("server is running");
})
