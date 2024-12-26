let argsToArray=function(){
console.log(arguments) 
//arguments is an object present-holds all the parameters passed so we dont need to pass them
//we get an object with 3 elements; it is not an array but an array like object, but has no array functionalities

console.log([].slice.call(arguments))//now we can use all the array functionalities on arguments object
}

argsToArray(1,2,3)

let mammal=function(legs){  //mammal is a base function constructor.; legs is a property.
    this.legs=legs;
}

//sub constructor
let cat=function(legs,isdomesticated){
mammal.call(this,legs)
this.isdomesticated=isdomesticated
}

let lion= new cat(4,false)  // this is an instance of the object cat
console.log(lion)

let numArr=[1,2,3]
console.log(Math.min.apply(null,numArr)) //numArr will get connverted to the list of arguments and we will get the minimum

//bind
let button=function(content){
    this.content=content
}

button.prototype.click=function(){   //we create a click event for button
    console.log(`${this.content} clicked`)
}

let newButton=new button('add')

let boundButton=newButton.click.bind(newButton) 
//this button is loosely bound to the newButton so we get undefined clicked

boundButton()

let myObj={
    asyncGet(cb){
        cb();
    },
    parse(){
        console.log('parse called')
    },
    render(){
        this.asyncGet(function(){
            this.parse()
        }.bind(this))
    }
    }
myObj.render()