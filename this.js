'use strict'
this.table='window table' //this here means global scope or window scope
const cleanTable=function(soap){
    const innerFunc=(_soap)=>{   //arrow function
    console.log(`cleaning ${this.table} using ${soap}`) 
    }
    innerFunc(soap) // or innerFunc.bind(this)(soap)
}
cleanTable.call(this,'some soap') //execute the cleanTable function as if it is a method of this
//and this in this case is a global object


this.garage={
    table:'garage table',
    
}

this.garage.table  //or window.garage.table

//this inside an object
let johnsRoom={
    table:"johns table",
    
};

//this inside a constructor
let createRoom=function(name){
    this.table=`${name}s room`
        // console.log(`cleaning ${this.table}`)
    }

//adds the function to the prototype space of createRoom and not in the createRoom
createRoom.prototype.cleanTable=function(soap){
    console.log(`cleaning ${this.table} using ${soap}`)
}

const jillsRoom=new createRoom('Jill')
const fathersRoom=new createRoom('Father')   //now we dont need to create room like previous method
console.log(johnsRoom.table)
// cleanTable.call(this.garage,'some soap')
// cleanTable.call(johnsRoom,'some soap')
// cleanTable.call(jillsRoom,'some soap')

jillsRoom.cleanTable('Some soap')
fathersRoom.cleanTable('Some soap') 