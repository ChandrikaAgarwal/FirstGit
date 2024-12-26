// function z(){
//     var b=900
//     function x(){
//         var a=7
//         function y(){
//             console.log(a,b)
//         }
//         y()
//     }
//     x()
// }
// z()



function x(){

    let a = 10;
    
    function y(){
    
    console.log(a); //prints 10 when z is called and undefined is printed because y does not return anything

    }
    
    return y;
    
    }
    
    
    const z = x()
    console.log(z);
    
    console.log(z()); 