const arr=[5,1,3,2,6]
function double(x){
    return x*2
}
function triple(x){
    return x*3
}

const output=arr.map((x)=>x.toString(2) //only one statement so return not required.
)
console.log(output);

//filter arr=[5,1,3,2,6]
function isOdd(x){
return x%2

}

const odd=arr.filter((x)=>x>4)
console.log(odd);

//Reduce- take all the values of an array and come with a single value out of them.
//sum or max

//conventional way

function findMax(arr){
 let max=0;
 for(let i=0;i<arr.length;i++){
   if (arr[i]>max){
       max=arr[i]
   }

 }
 return max
}
console.log(findMax(arr));


const maximum=arr.reduce(function(acc,curr){
if (curr>acc){
    acc=curr
}
return acc
},0)
console.log(maximum);

const users=[
    {firstname:"akshay",lastname:"saini",age:29},
    {firstname:"donald",lastname:"trump",age:75},
    {firstname:"Elon",lastname:"musk",age:75},
    {firstname:"Deepika",lastname:"Padukone",age:50},
    {firstname:"Alia",lastname:"Bhatt",age:32},
];

//list of full names

const fullName=users.map(x=>x.firstname+" "+x.lastname)
console.log(fullName);

function sameAge(x){
    var count=0
    if (x.age===75){
     count=count+1
    }
    return count
}
//acc={26:1,75:2,50:1,32:1}
const ageCount=users.reduce(function(acc,curr){
  if(acc[curr.age]){
   acc[curr.age]+=1
  }
  else{
    acc[curr.age]=1
  }
  return acc
},{})

console.log(ageCount);

const firstName=users.filter((x)=>x.age<50).map((x)=>x.firstname)
// console.log(firstName);

       
const firstNamered=users.reduce(function(acc,curr){
    if(curr.age<50){
        acc.push(curr.firstname)
    }
    return acc
},[])
console.log(firstNamered);
