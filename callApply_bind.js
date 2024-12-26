var obj={num:2} //num is property of obj;no method associated with this
var obj2={num:5}

var addToThis= function(a,b,c){
    return this.num+a+b+c //this method has no property called num but is returning num
}

//call
console.log(addToThis.call(obj,1,2,3)) //a=3  
// syntax: functionName.call(obj,function arguments)

//apply
var arr=[1,2,3]
console.log(addToThis.apply(obj,arr)) 
//in apply we can combine all the different arguments in an array but in call we have to pass one by one
console.log(addToThis.apply(obj2,arr)) 

//bind
var bound =addToThis.bind(obj2)  //it bounds the function to the object, we dont need to pass the argument
//to get the answer we need to call bound,bind returns a method that can be called later.
console.dir(bound) //here it returns a function which i can use later for the result.

console.log(bound(1,2,3)) //now no need to pass an object becuase the object is already bounded to addToThis