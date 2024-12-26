//closure
function attacheventListeners(){
let count=0
document.getElementById('clickMe').addEventListener("click",function xyz(){
console.log("button clicked",++count)
})//this function xyz will come back to our call stack when the button is clicked
}

attacheventListeners() 
//when js runs this code the callback function xyz forms a closure with count 
// and remembers where the count is present

