setTimeout(function(){
    console.log("timer")
},5000) //this function is a callback function 
function x(y){
console.log("x")
y()
}
x(function y(){ 
console.log("y")
})