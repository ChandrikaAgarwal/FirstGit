var obj={
    "key1": "value",
    "key2":"value2",
    "key3": "value3"

}

var arr=["value1","value2"]

for(let i=0;i<arr.length;i++){
    arr[i]
}

// let arrofkeys=Object.keys(obj)
Object.keys(obj).forEach(key=>{
  console.log( key)
})


const person={
    id:252,
    username:"dcode",
    age:32,
    hobbies:["software developement","Gardening"],
    active: true
}

const keys=Object.keys(person)
console.log(keys)
console.log(obj.length)

