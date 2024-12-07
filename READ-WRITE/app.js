const http=require('http')
const fs=require('fs')
const server=http.createServer((req,res)=>{
    //url,method

    const url=req.url
    const method=req.method
    //we want to display a form in our homepage
    if(req.url==='/'){
        //return a form

        res.setHeader('Content-type','text/html')
        res.end(
            `
            <form action="/message" method="POST">
            <label for="username">Name:</label>
            <input type="text" name="username"></input>
            <button type="submit">Add</button>
            </form>
            `
        );

    }else{
        if(req.url==='/message'){
            res.setHeader('Content-type','text/html');
            let dataChunks=[]
            req.on('data',(chunks)=>{
              console.log(chunks)
              dataChunks.push(chunks)
              
            })
            req.on('end' ,()=>{
            let combinedBuffer=Buffer.concat(dataChunks)
            console.log(combinedBuffer.toString());
            // res.end('<h1>message recieved</h1>')
            //to extract ABC from user 
            let value=combinedBuffer.toString().split("=")[1]
            console.log(value);
            //writing data to file
            fs.writeFile('formValues.txt',value,(error)=>{
              res.statusCode=302; //you have been redirected to slash when we click on add.
              res.setHeader('Location','/read')
              res.end();
            })
            })
        }else{
            if(req.url=='/read'){
                //read from the file
                fs.readFile('./formValues.txt',(err,data)=>{
                  console.log("data: ",data.toString());
                  res.end(`
                    <h1>${data.toString()}</h1>`);
                })
            }
        }
    }
})

server.listen(5000,()=>{
    console.log("server is running");
    
})