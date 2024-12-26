const getBtn=document.getElementById("get-btn")
const postBtn=document.getElementById("post-btn")
const putBtn=document.getElementById("put-btn")
const deleteBtn=document.getElementById("delete-btn")

getBtn.addEventListener('click',getTodos);
postBtn.addEventListener('click',postTodos);
putBtn.addEventListener('click',putTodos);
deleteBtn.addEventListener('click',deleteTodos);

function getTodos(){
axios.get("https://crudcrud.com/api/50994c899ebf4f178e530e0a69c34869/todo")
.then(res=>console.log(res))
.catch(err=>console.log(err))
}

function postTodos(){
    axios.post("https://crudcrud.com/api/50994c899ebf4f178e530e0a69c34869/todo",{
        title:"Learn Axios",
        completed:"false"
    })
    .then(res=>console.log(res))
    .catch(err=>console.log(err));
}

function putTodos(){ //update already existing data
    axios.put("https://crudcrud.com/api/50994c899ebf4f178e530e0a69c34869/todo/67110600a0a8cd03e818ad3d",{
      title:"Learn Axios",
      completed:"true"
    })
    .then(res=>console.log(res))
    .catch(err=>console.log(err));
}

function deleteTodos(){
    axios.delete("https://crudcrud.com/api/50994c899ebf4f178e530e0a69c34869/todo/67110600a0a8cd03e818ad3d")
    .then(res=>console.log(res))
    .catch(err=>console.log(err));   
}


