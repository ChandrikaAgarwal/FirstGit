// function stepOne(callback) {
//     setTimeout(() => {
//         console.log('Step 1');
//         callback('Message from Step 1');
//     }, 2000);
// }

// function stepTwo(message, callback) {
//     setTimeout(() => {
//         console.log('Step 2 received: ' + message);
//         callback('All steps completed');
//     }, 1000);
// }

function stepOne() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Step 1');
           
        }, 2000);
    })

}

function stepTwo(message) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Step 2 recieved: '+ message);
        }, 1000);
    })
}


// create promises chanining here

stepOne().then((result) => {
    console.log(result)
    stepTwo("Message from Step 1").then((result) => {
        console.log(result)
        console.log("All Steps Completed")
    })
})