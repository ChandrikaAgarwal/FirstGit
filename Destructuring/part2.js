const students={
    name:"Ravi",
    address:{
        city:"Kolkata",
        country: "India"
    }
}

//traditional
// const city=students.address.city
// console.log(city);

//destructuring

const{address:{city:cityName}}=students //creating a destructuring object from already existing object student.
console.log(cityName); //here we have changed the name of the prop city to cityName


//array of objects
const users=[
    {
        name:'Ravi',
        age:20
    },
    {

        name :'Rajesh',
        age: 25
    }
]

// let firstName=users[0].name
// let secondName=users[1].name
// console.log(firstName,secondName);

//destructuring

const [{name:firstName},{name:secondName,age}]=users
console.log(firstName,secondName,age);