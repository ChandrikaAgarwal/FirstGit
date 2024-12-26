studentobj = {

    'yash': 26,
    
    'vaibhav': 24,
    
    'rajesh' : 25,
    
    }
    
    
var age=25
function findStudent(obj, age) {

Object.keys(obj).forEach(key=>{
    if(obj[key]===age){
        res= key
    }else{
        res =-1
    }
})
return res
}

result=findStudent(studentobj,age)
console.log(result)

