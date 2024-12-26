const promise=new Promise((resolve,reject)=>{
    setTimeout(function(){
        const bookSearch=true;
        if(bookSearch){
            resolve("Book found")
        }else{
            reject('Book not found')
        }
    },3000)
})

promise
.then((result)=>{
    console.log(result) 
})
.catch((error)=>{
console.log(error) //without this we get an error of not handling the rejection of a promise
})
//new keyword indicates we are making a new promise
//we handle a promise using then and catch block