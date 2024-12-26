let multiply=function(x,y){
    console.log(x*y)
}

let multiplyByTwo=multiply.bind(this,2) //this bind method gives the copy of multiply method and 
// does not call it directly; so x=2
// so this is same as :
// let multiplyByTwo=function(2,y){
//     console.log(x*y)
// }

multiplyByTwo(5) //5 refers to 5  output=10

let multiplyByThree=multiply.bind(this,3,2) //here 5 gets ignored and y=2; output=6
multiplyByThree(5)


//function closures

let multiply2=function(x){
    return function(y){
        console.log(x*y)  //this function can access the x variable even after the outer function returns.
    }
}

let mult=multiply2(2)
mult(3)  //output 6   we can create more methods