const ul = document.getElementById("todoItems");
function handleFormSubmit(event) {
  event.preventDefault();
  const todoList = {
    todoName: event.target.todo.value,
    description: event.target.description.value,
    isDone: false,
  };
  axios
    .post(
      "https://crudcrud.com/api/d8efbb535dd7421795a4493878a106ac/todoListItems",
      todoList
    )

    .then((response) => displayTodo(response.data))
    .catch((error) => console.log(error));

  document.getElementById("todo").value = "";
  document.getElementById("description").value = "";
}

function displayTodo(todoList) {
  const todoItem = document.createElement("li");
  const displayItems = [`${todoList.todoName}-${todoList.description}`];
  todoItem.innerHTML =
    displayItems +
    '<button class="done">Done</button> <button class="delete">Delete</button> ';
  todoItem.dataset.id = todoList._id;
  ul.appendChild(todoItem);
}

window.addEventListener("DOMContentLoaded", () => {
  axios
    .get(
      "https://crudcrud.com/api/d8efbb535dd7421795a4493878a106ac/todoListItems"
    )
    .then((response) => {
      console.log(response);
      for (var i = 0; i < response.data.length; i++) {
        displayTodo(response.data[i]);
      }
    });
});

const delBtn = document.querySelector(".delete");

ul.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    const item = e.target.parentElement;
    const id = item.dataset.id;
    console.log(id);
    console.log(
      `https://crudcrud.com/api/d8efbb535dd7421795a4493878a106ac/todoListItems/${id}`
    );

    axios
      .delete(
        `https://crudcrud.com/api/d8efbb535dd7421795a4493878a106ac/todoListItems/${id}`
      )
      .then((res) => {
        console.log(res);
        ul.removeChild(item);
      })
      .catch((err) => console.log(err));
    // console.log(e.target);
  }
});

const tasksDone = document.getElementById("tasksDone");
ul.addEventListener("click", (e) => {
  if (e.target.classList.contains("done")) {
    const item = e.target.parentElement;
    const doneId = item.dataset.id;
    const tasks = {
      todoName: e.target.parentElement,
      description: e.target.parentElement.description,
      isDone: true,
    };
    console.log(tasks);

       
    axios
      .get(
        `https://crudcrud.com/api/d8efbb535dd7421795a4493878a106ac/todoListItems/${doneId}`
      )
      .then((res) => {
        const donetask = document.createElement("li");
        const displayDoneTask = [`${res.data.todoName}-${res.data.description}`];
        const text = document.createTextNode(displayDoneTask);
        donetask.appendChild(text);
        tasksDone.appendChild(donetask);
        ul.removeChild(item);
        axios
          .put(
            `https://crudcrud.com/api/d8efbb535dd7421795a4493878a106ac/todoListItems/${doneId}`,
            {
              todoName:res.data.todoName,
              description:res.data.description,
              isDone: true,
            }
          )
          .then((resp) => {
            console.log(resp.data);
          })
          .catch((err) => {
            console.log(err);
          });
      });
  }
});
