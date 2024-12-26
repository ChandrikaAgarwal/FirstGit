"use Strict"  //tells the browser to use the latest functionality

let getA=a=>a; //function replaced by =>; argument- left side; body of function-right side

console.log(getA(1))

let square=(a)=>{return a*a};


console.log(square(4))


var x=function(){
    // var that=this
    this.val=1;
    setTimeout(function(){
        this.val+=1   //here the this dosen't recognize the outer this.
        console.log(this.val)

    }.bind(this),1)
}

var xx=new x();

