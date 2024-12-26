//currying-one func returning another func and we call both the functions

function addConst(constant1){ //returning a function
    return (value)=>{
        return (value2)=>{ value+constant1+value2
    }
}
}

const addedConst=addConst(15)

console.log(addedConst(2))


