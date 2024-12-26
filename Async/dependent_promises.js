function orderFood(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            let foodDelivered=true
            if(foodDelivered){
                resolve("Food Delivered")
            }else{
                reject("Food Not delivered")

            }
    },2000)
 
    })

}


function orderDessert(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            let dessertDelivered=false
            if(dessertDelivered){
                resolve("Dessert Delivered")
            }else{
                reject("Dessert Not delivered")

            }
    },2000)
 
    })

}
//the second promise is dependent on the first one, 
// only after first promise is resolved then the second will be resolved

// orderFood()
// .then((results)=>{
// console.log(results);
// orderDessert()
// .then((dessertMsg)=>{
// console.log(dessertMsg);
// console.log("Dream meal fulfilled");

// }).catch((dessertError)=>{
//     console.log(dessertError);
//     console.log("Dream meal failed");

// })
// }).catch((error)=>{
// console.log(error);
// console.log("Dream meal failed");

// })

//this is the improved code
orderFood()
.then((results)=>{
console.log(results);
return orderDessert(); //returned a promise
})
.then((dessertMsg)=>{ //this then is of promise 2 and will only run when promise 1 is resolved
    console.log(dessertMsg);
    console.log("Dream meal delivered");
    })
.catch((error)=>{  //there is one common catch block for every promise
    console.log(error);
    console.log("Dream meal failed");
    
    })