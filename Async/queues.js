// function buyBike(){
//     setTimeout(function planTrip(){
//       setTimeout(()=>{
//         console.log("Trip planned")
//       },1000)
//       console.log("Bike Bought")
//     },2000)
// }

// buyBike()

function buyBike(callback){
      setTimeout(()=>{
        console.log("Bought Royal Enfield Himalayan")
        callback()
      },2000)
    }
    
    function planTrip(){
      setTimeout(()=>{
        console.log("Trip to Ladakh planned")
      },1000)
    }

    buyBike()
    planTrip()
