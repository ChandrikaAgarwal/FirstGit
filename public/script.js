const form=document.getElementById('appointment-form')
const bookings=document.getElementById('bookings')
let edit=false;

const api_url='http://localhost:3000';
form.addEventListener('submit', async (e)=>{
    e.preventDefault();
      
    const userDetail={
         name:e.target.name.value,
         email:e.target.email.value,
         phone:e.target.phone.value
    }    
    
     const user=await axios.post(`${api_url}/appointments`,userDetail)
             .then((response)=>{           
            console.log("userDetail: ",response.data);
            displayBooking(response.data.userdetail,response.data.userdetail.id)
            // console.log("Response from postAddUser: ",response);
        }).catch((err)=>console.log(err))
    })

    function displayBooking(userDetail,id){
        const newBooking=document.createElement('li')
        const details=[`${userDetail.name}-${userDetail.email}-${userDetail.phone}`]
        newBooking.innerHTML=details+'<button class="delete">Delete</button> <button class="edit">Edit</button>';
        newBooking.dataset.id=id
        bookings.appendChild(newBooking)

        form.reset()
    }

    window.addEventListener('DOMContentLoaded', ()=>{
        axios.get(`${api_url}/appointments`)
        .then((response)=>{
            // console.log("Getting response: ",response);
            for(let i=0;i<response.data.users.length;i++){
                // console.log(response.data.users[i]);
                displayBooking(response.data.users[i],response.data.users[i].id)

            }
        }).catch(err=>console.log(err));
    })

    const delBtn=document.querySelector('.delete');
    bookings.addEventListener("click", (e)=>{
        if(e.target.classList.contains('delete')){
            const item=e.target.parentElement;
            const id=item.dataset.id;
            axios
            .delete(
                `${api_url}/appointments/${id}`
            )
            .then((res)=>{
                // console.log(res);
                bookings.removeChild(item)
                
            }).catch(err=>console.log(err));
        }
    });

    const editBtn=document.querySelector('.edit')
    bookings.addEventListener("click",async (e)=>{
        if(e.target.classList.contains('edit')){
        const item=e.target.parentElement;
        console.log(item);
        const id=item.dataset.id;
        console.log(id);
        await axios.get(`${api_url}/appointments/${id}`
        )
        .then((res)=>{
            console.log("To Edit data ",res);
            bookings.removeChild(item)
            let editUser=populateFields(res.data.user);
            const response= axios.put(`${api_url}/appointments/${id}`,editUser);
            console.log("Response: ",response);
            
            
            
        }).catch(err=>console.log(err))
    }
    })

    function populateFields(response){
       
       let name= document.getElementById('name').value=response.name;
        let email=document.getElementById('email').value=response.email;
        let phone= document.getElementById('phone').value=response.phone;
        return editUser={name,email,phone}
          }