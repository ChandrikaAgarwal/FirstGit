me={
    name:"Ashutosh Verma",
    age:26,
    thisinArrow:()=>{
        console.log("My name is "+this.name);
        
    },
    printAllDetails(){
      function findname(){
        console.log("My name is "+ this.name);
        
      }
      function printage(){
        console.log("my age is "+this.age);
        
      }
      findname()
      printage()
    }
};

me.printAllDetails()
me.thisinArrow()