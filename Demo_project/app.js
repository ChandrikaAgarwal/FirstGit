const http=require('http')
const file=require('fs')
const server=http.createServer((req,res)=>{
    const url=req.url
    const method=req.method
    
    if(url=='/' && method==='POST'){
        let dataChunk=[]
            req.on('data',(chunk)=>{
             console.log(chunk);
             dataChunk.push(chunk)
            })
           req.on('end',()=>{
            let combinedBuffer=Buffer.concat(dataChunk)
            console.log(combinedBuffer.toString());
            let value=combinedBuffer.toString().split('=')[1]

            if(value){
                file.writeFile('message.txt',value,(err)=>{
                  if(err){
                    console.error("Error writing to file ",err)
                    res.statusCode=500;
                    res.end('Internal server error')
                  }else{
                    console.log("Message saved! ");
                    res.statusCode=302;
                   res.setHeader('Location','/')
                    res.end()
                  }
                })
            }
        })
    }else{
        if(url==='/'&& method=="GET"){
            file.readFile('./message.txt',(err,data)=>{
                let message=''
                if(!err && data){
                    message=data.toString()
                }
            
            res.setHeader('Content-type','text/html')
                res.end(`
                      <h1>${message}</h1>
                     <form action="/" method="POST">
            <input type="text" name="message"></input>
            <button type="submit">Send</button>
            </form>
                    `)
            })
        
        }
    }
    
})


server.listen(3000,()=>{
    console.log("server is running");
    
});