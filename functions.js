x()


//function statement
function x(){
    console.log("a,clled")
}


//function expression
var b=function(){
    console.log("b called")
}
b()

//function declaration===function statement

//anonymous function
// function(){

// }

//named function expression

var b=function xyz(){
    console.log("b called")
}
b()

//parameters and arguments
var b=function(param1,param2){  //parameters are local to function; cannot access them outside.
    console.log("b called")
}
b(1,2) //these are arguments


//First class functions
var b=function(param1){  //parameters are local to function; cannot access them outside.
    console.log(param1)
}
function xyz(){

}
b(xyz)