// var a=100
// {
//     var a=10;
//     let b=20;
//     const c=30
//     console.log(a)
//     console.log(b)
//     console.log(c)
// }
// console.log("modified",a) //shadowing

//let

let b=100
{
    var a=10;
    let b=20;
    const c=30
    console.log(a)
    console.log(b) //shadows b outside the block; this b is different from the outer one.
    console.log(c)
}
console.log("modified",b) 

//functions

const c=100
function x(){
    const c=30;
    console.log("c inside function ",c)
}
x();
console.log("c outside function",c)

//illegal shadowing
    
let e=20
{
    let e=30
    console.log(e)
}
console.log(e)

const a=10
{
    var a=100
}
console.log(a)