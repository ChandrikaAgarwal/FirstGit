let colors=['blue','red','green']

// let firstcolor=colors[0]
// let secondcolor=colors[1]
// console.log(firstcolor,secondcolor);

//destructuring

let [firstcolor,secondcolor]=colors;
console.log(firstcolor,secondcolor);

let car={
    'brand':'Toyota',
    'model':'Camry',
}
let brandName=car.brand
let modelName=car.model

// console.log(brandName,modelName);

//destructuring
let{brand:carBrand,model:carModel}=car //renaming the properties of the object.
console.log(carBrand,carModel);

function printDetails(brand,model){
console.log(brand,model);

}


//destructuring helps us get the values from arrays and objects in new variables.