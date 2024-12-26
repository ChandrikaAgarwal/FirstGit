//code 1
function x(){
    var a=function y(){ //this is valid
        console.log("a= "+a)

    }
    a()
}
x()

//code 2
function x(){
    var a=7

    y()
}
x(function y(){ //this is also valid; function passed as a parameter to a function.
    console.log("a=",a)})

//code 3
    function x(){
        var a=7;
        function y(){ 
            console.log(a)
    
        }
        return y  //also valid;  y is returned to the place where x was invoked; this returns the whole code of y
    }
   var z= x()  //when y is returned x has been destroyed; the EC of x no longer in the call stack
   //z contains function y, so now b/c x is destroyed we can use z outside the scope of x 

console.log("z=",z)
z() //here it prints 7; though x has been destroyed y remembers its lexical 
// scope where it has come from; it came from x where there was 'a'
    
