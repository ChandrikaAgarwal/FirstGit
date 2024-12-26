var obj={
    "key1":"value 1",
    "key2":"value2",
    "key3":"value3"
}

var arr=["value","value1"]
for (let i=0;i<arr.length;i++){

}

//when dealing with objects we first have to figure out the keys- so for this we have a class Object

var arrofKeys=Object.keys(obj) // gives array of keys
arrofKeys.forEach(key=>{
    console.log(obj[key])  //to print each value corresponding to each key.
})

