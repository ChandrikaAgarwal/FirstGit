const obj1={
    key1:"value1",
    key2:"value2"
}

const obj2=obj1  //obj2 stores the reference of obj1,this is pass by reference

obj2.key1="value4"  //updates the value of key1 in obj1 b/c obj2 storess the reference of obj1
console.log(obj1) //this is deep copy b/c obj1 and obj2 point to the same reference.

//spread operator

const obj3={...obj1} //now this is no longer pass by reference, now a new object will be created and its reference will be stored in obj3
obj3.key1="value100" //here now obj1 value will not be affected b/c we have created a new copy of the object
console.log("obj1 ",obj1)
console.log("obj3 ",obj3)

//we can also change the value of a key in this way
const obj4={...obj1,key1:"value50"}
console.log("obj1 ",obj1)
console.log("obj4 ",obj4)

//adding new values
const obj5={...obj1,key1:"value50",key5:"new_key"}
console.log("obj1 ",obj1)
console.log("obj5 ",obj5)

const arr1=[1,2]

const arr2=[3,4]

const arr3=[...arr1,...arr2] //union of arr1 and arr2
console.log(arr3)

const objarr1=[{a:1},{b:5},{c:0}]
objarr1.push({e:10}) //we can also add a new obj like this in the array of objects
//to add a new obj to the array of objects
const new_objarr=[...objarr1,{d:9}]
console.log(new_objarr)
console.log(objarr1)
