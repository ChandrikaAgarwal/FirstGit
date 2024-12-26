function bookSearchPromise(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          const bookSearch=Math.random()>0.5
          if (bookSearch){
            resolve("Book Found")
          }
          else{
            reject("Book not found")
          }
        },3000)
    })
   
}

bookSearchPromise()
.then((result)=>{
    console.log(result);
})
.catch((error)=>{
    console.log(error);
    
})