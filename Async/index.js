const cart=["shoes","pants","kurta"]
api.createOrder(cart, function(){  //the function passed as argument is a callback function
    api.proceedToPayment(function(){
        api.showOrderSummary(function(){
            api.updateWallet()
        })
    })
})

//since payment can only be done after an order has been placed 
//therefore there is a dependency b/w the two we use callbacks
//one callback inside another callback or some if statement

//inversion of control: we loose control over our code while using callbacks. when we pass our code to some other code we
//we loose control over our code and dont know ehat is happening behind the scenes.

