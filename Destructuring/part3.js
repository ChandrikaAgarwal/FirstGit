//combining rest operator and destructuring together

const studentDetails={
    name:"Shubham",
    city:"Allahabad",
    age:30,
    id:1,
    class:10
}

//destructuring

const {name,city,...restofAttr}=studentDetails
console.log(name,city,restofAttr);
//rest of the attributes are returned as object b/c they were not destructured.

const [, , website] = ["Yash", "Raj", "www.google.com"];

console.log(website); 