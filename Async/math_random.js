console.log(Math.random()) //JS has a Math object on which we have random method.
//returns any number between 0 and 1

console.log(Math.random()>0.5) //here we check that if the number returned by math.random is > 0.5 it returns true else false

const ans=Math.random()>0.5
console.log(ans) //returns boolean value


function bookSearchPromise(){

    const promise=new Promise((resolve,reject)=>{

    setTimeout(function(){
        const bookSearch=Math.random()>0.5;
        if(bookSearch){
            resolve("Book found")
        }else{
            reject('Book not found')
        }
    },3000)
})
return promise
}

bookSearchPromise()
.then((result)=>{
    console.log(result) 
})
.catch((error)=>{
console.log(error) //without this we get an error of not handling the rejection of a promise
})

