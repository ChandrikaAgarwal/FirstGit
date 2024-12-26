const ul=document.getElementById('todoItems')
function handleFormSubmit(event){
    event.preventDefault();
    const todoList={
        todoName: event.target.todo.value,
        description:event.target.description.value,
        idDone:false
    };
    axios
    .post("https://crudcrud.com/api/f6966e935e5440f281c719cf565f4026/todoListItems",todoList)
   
    .then((response)=>displayTodos(response.data))
    .catch((error)=>console.log(error));

    document.getElementById("todo").value = ""
    document.getElementById("description").value = ""
}

function displayTodos(todoList){
    const todoItem=document.createElement('li')
    const displayItems=[`${todoList.todoName}-${todoList.description}`]
    todoItem.innerHTML=displayItems+'<button class="done">Done</button> <button class="delete">Delete</button>'
    ul.appendChild(todoItem)
}

window.addEventListener('DOMContentLoaded',()=>{
    axios.get("https://crudcrud.com/api/f6966e935e5440f281c719cf565f4026/todoListItems")
    .then((response)=>{
        console.log(response);
        for(var i=0;i<response.data.length;i++){
            displayTodos(response.data[i])
        }  
    })
})


const delBtn=document.querySelector(".delete")

delBtn.addEventListener('click',(e)=>{
    axios.delete("https://crudcrud.com/api/f6966e935e5440f281c719cf565f4026/todoListItems/_id")
    // ul.removeChild(e.target.parentElement)
})
























