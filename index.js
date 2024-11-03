const ul = document.getElementById("bookings");
function handleFormSubmit(event) {
  event.preventDefault();
  const busBook = {
    Name: event.target.name.value,
    email: event.target.email.value,
    phone:event.target.phone.value,
    carNum:event.target.carNum.value
  };
  axios
    .post(
      "https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking",
      busBook
    )

    .then((response) => displaybookings(response.data))
    .catch((error) => console.log(error));

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("carNum").value = "";
}

function displaybookings(busBook) {
  const booking = document.createElement("li");
  const displaybooking = [`${busBook.Name}-${busBook.email}-${busBook.phone}-${busBook.carNum}`];
  booking.innerHTML = displaybooking +' <button class="delete">Delete</button> <button class="edit">Edit</button>';
  booking.dataset.id = busBook._id;
  ul.appendChild(booking);
}

window.addEventListener("DOMContentLoaded", () => {
  axios
    .get(
      "https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking"
    )
    .then((response) => {
      console.log(response);
      for (var i = 0; i < response.data.length; i++) {
        displaybookings(response.data[i]);
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
      `https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking/${id}`
    );

    axios
      .delete(
        `https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking/${id}`
      )
      .then((res) => {
        console.log(res);
        ul.removeChild(item);
      })
      .catch((err) => console.log(err));
    // console.log(e.target);
  }
});

const editBtn=document.querySelector('.edit')
ul.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit")) {
      const item = e.target.parentElement;
      const id = item.dataset.id;
      axios.get(
        `https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking/${id}`
      )
      .then((res)=>{
        console.log(res.data);
        populateFields(res.data)
        
      })
      .catch((err)=>{
        console.log(err);
        
      })
      axios
        .delete(
          `https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking/${id}`
        )
        .then((res) => {
          // console.log(res);
          ul.removeChild(item);
             
        })
        .catch((err) => console.log(err));
      // console.log(e.target);
    }
  });
  
  function populateFields(response){
   document.getElementById('name').value=response.Name
   document.getElementById('email').value=response.email
   document.getElementById('phone').value=response.phone
   document.getElementById('carNum').value=response.carNum
  }

  const filterSelect=document.getElementById("filter")
  filterSelect.addEventListener('change',()=>{
    const selectBus=filterSelect.value
    console.log(selectBus);
    
    axios
    .get(
      "https://crudcrud.com/api/21675c03de3540ee9da6539767d91fb7/busBooking"
    )
    .then((res)=>{
      ul.innerHTML="";
      const filteredBookings=selectBus==="All"
      ? res.data
      : res.data.filter(booking=>booking.carNum===selectBus);

      filteredBookings.forEach(booking =>displaybookings(booking)) 
        
      
    })
    .catch((error)=>console.log(error));
  })


