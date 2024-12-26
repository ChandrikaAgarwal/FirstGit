function boardBusAt10(){
    return new Promise((resolve,reject)=>{
       setTimeout(function(){
         let busArrivesOnTime=Math.random()>0.5;
         if(busArrivesOnTime){
            resolve("Board the bus")
         }else{
            reject("Error: Bus is late")
         }
       },3000) 
    })
}

boardBusAt10()
.then(function(result){
    console.log(result)
}).catch(function(error){
    console.log(error)
})