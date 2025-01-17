const User=require('../models/user');
exports.postAddUser= async (req,res,next)=>{
    try{
        const name=req.body.name
        const email=req.body.email
        const phone=req.body.phone
        const newUser=await User.create({
            name: name,
            email:email,
            phone:phone
    
        });

        //structure of the response being sent
        
        console.log("New User",newUser)
       res.status(201).json({message:'Appointment booked',userdetail:newUser})
    //    console.log(userdetail);       
       
    }catch(err){
        res.status(500).json({error: 'Failed to book an appointment',details:err})
    }
    
};

exports.getUsers= async (req,res,next)=>{
    try{
        console.log("Response",res);
        const users=await User.findAll()
        res.status(200).json({users})
    }catch(err){
        res.status(500).json({ message: 'Error fetching users', details: err });
    }
    
};

exports.deleteUser=async(req,res,next)=>{
 try{
  const {id} =req.params;
  await User.destroy({where:{id}});
  res.status(200).json({message: 'Appointment deleted successfully!'});
 }catch(err){
    res.status(500).json({ error: 'Failed to delete appointment', details: err });
 }
};

exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id)
        // .then(user=>{
        //     return user.destroy()
        // })
        // .then(result=>{
        //     console.log("User to be edited removed from db");
            
        // })
        // .catch(err=>console.log(err))

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
       
        res.status(200).json({ user });
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user', details: err.message });
    }
};
exports.updateUser=async (req,res,next)=>{
    try{
        const {id} =req.params;
        const { name, email, phone } = req.body;
        // const updatedName=req.body.name
        // const updatedEmail=req.body.email
        // const updatedPhone=req.body.phone
       const user= await User.findByPk(id)
       .then(user=>{
        return user.destroy()
    })
    .then(result=>{
        console.log("User to be edited removed from db");
        
    })
    .catch(err=>console.log(err))
            // user.name=updatedName;
            // user.email=updatedEmail;
            // user.phone=updatedPhone;

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
             // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        await user.save()
            res.status(200).json({message: 'Appointment deleted successfully!', edituser:user});

    }catch(err){
        res.status(500).json({ error: 'Failed to delete appointment', details: err.message });
    }
}