const name = (arr)=>{
    let ind=0  //to keep track of the current name
    return function (){
        if(ind<arr.length){
        console.log("Hello "+arr[ind])
        ind+=1

  }
    }

    }
let fun = name(["Ram","Shyam"]);

fun()// Print Hello Ram

fun()//print Hello Shyam


function x(){
    var a=function y(){ //this is valid
        console.log("a= "+a)

    }
    a()
}
x()

