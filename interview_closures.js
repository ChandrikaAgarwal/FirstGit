function x(){
    var i=1;
    setTimeout(function(){  //this callback function forms a closure and remembers the reference to i;
        // wherever the function goes it takes the reference of i alongwith it.
        console.log(i)
    },3000)
    console.log("Namaste Javascript")
}
x(); //prints 1 after 1 seconds

