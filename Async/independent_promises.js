const amanPromise=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        const payBacks=true
        if (payBacks){
        resolve("Aman paid back")
        }else{

            reject("Aman did not pay back")
        }
    },3000)
    
})

const ramanPromise=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        const payBacks=true
        if (payBacks){
        resolve("Raman paid back")
        }else{

            reject("Raman did not pay back")
        }
    },3000)
    
})

const gaganPromise=new Promise((resolve,reject)=>{
    setTimeout(()=>{
        const payBacks=true
        if (payBacks){
        resolve("Gagan paid back")
        }else{

            reject("Gagan did not pay back")
        }
    })
    
})

Promise.all([amanPromise,ramanPromise,gaganPromise])
.then((results)=>{
    console.log(results)
}).catch((error)=>{
    console.log(error)
})
