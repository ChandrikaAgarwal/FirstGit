// var student = function(name){

//     this.name = name;
  
//     function printName() {
  
//       console.log(this.name)
  
//     }
  
//      printName()
  
//   }
  
//   var yash = new student("yash")

// function fun1(a){

//   const fun2 = (b) => {
  
//   a = a + b;
  
//   console.log(a)
  
//   }}
  
  
//   fun1(10)(30)


console.log('start');


const promise1 = Promise.resolve().then(() => {

  console.log('promise1');

  const timer2 = setTimeout(() => {

    console.log('timer2')

  }, 0)

});


const timer1 = setTimeout(() => {

  console.log('timer1')

  const promise2 = Promise.resolve().then(() => {

    console.log('promise2')

  })

}, 0)


console.log('end');