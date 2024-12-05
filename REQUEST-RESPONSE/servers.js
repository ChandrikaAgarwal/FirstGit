const http=require('http')
const server=http.createServer((req,res)=>{ //for initializing a server
    console.log("Server is created");

    res.setHeader('Content-type','text/html') //we want to send back html content
    // we will make our server give different msgs based on the url client has asked for
    res.statusCode=200 //ok
    if (req.url=='/home'){
        res.end("<h1>Welcome home</h1>")
    }else{
        if(req.url=='/about'){
            res.statusCode=200
            res.end("<h1>Welcome to About Us</h1>")
        }else{
            if(req.url=='/node'){
                res.statusCode=200
                res.end("<h1>Welcome to my Node Js project</h1>")
            }else{
                res.statusCode=404;
                res.end("<h1>Page not Found</h1>")
            }
        }
    }
    
})

let port=3001;
server.listen(port,()=>{
    console.log("server is running");
})
