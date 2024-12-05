function sum(n1,n2,n3){
    return n1+n2+n3
}

function sum(num1,...numbers){
    console.log("num1: ",num1 );
    console.log("numbers ",numbers);
    
    
    console.log("numbers ",numbers);
    
}

let result=sum(5,3,2) //advantage of using rest operator is we can pass more than 3 arguments
//but in the previous code we could only pass three arguments.
console.log(result);
