let arr=[1,2,3,4]
let bufferValues=Buffer.from(arr)
console.log(bufferValues);

let value=" ABC"
let bufferValue=Buffer.from(value)
console.log(bufferValue);

//concat fxn
const combinedBuffer=Buffer.concat([bufferValue,bufferValues])
console.log(combinedBuffer);
console.log(combinedBuffer.toString());


