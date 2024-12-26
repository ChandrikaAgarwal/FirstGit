let name={
    firstname:"Akshay",
    lastname:"Saini",
    printFullName:function(){
        console.log(this.firstname+" "+this.lastname); //this points to the object
        
    }
}
name.printFullName()

let name2={
    firstname:"MS",
    lastname:"Dhoni",
    
    }
    
//function borrowing using call
//first argument of call tells us where we want our this to point
name.printFullName.call(name2)