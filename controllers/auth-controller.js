const User=require("../models/users")
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const registerUser=async(req,res)=>{
    try{
     // extract user information from request body and fronted
     const {username,email,password,role}=req.body;
     // check the user already exist in database 
     const checkExistingUser=await User.findOne({$or : [{username},{email}]})
     if(checkExistingUser){
        return res.status(400).json({
            success:false,
            message:"user is already exist please try different username or email",
        });
     }
     //hash user password
     const salt=await bcrypt.genSalt(10);
     const hashedPassword=await bcrypt.hash(password,salt);

     // create a new user and save in database
     const newlyCreatedUser= new User({
        username,
        email,
        password:hashedPassword,
        role:role || 'user'
     })

     await newlyCreatedUser.save();
     if(newlyCreatedUser){
        res.status(201).json({
            success:true,
            message:"user register successfully",
        })
     } else{
        res.status(400).json({
            success:false,
            message:"unable to register user ! please try again",
        })
     }
    }catch(e){
        console.log(e);
      res.status(500).json({
        success:false,
        message:"some error occured please try again"
      })
    }
}

const loginUser =async(req,res)=>{
     try{
      const {username,password}=req.body;

      // find user is already register or not
      const user =await User.findOne({username});
      if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid Credetential"
        })
      }
      //if the password is correct or not

      const isPasswordMatch=await bcrypt.compare(password,user.password);

      if(!isPasswordMatch){
        return res.status(400).json({
            success:false,
            message:"Invalid Credetential"
        })
      }

      // create user token
      const accessToken=jwt.sign({
        userId:user._id,
        username:user.username,
        role:user.role

      },process.env.JWT_SECRET_KEY )

      res.status(200).json({
        success:true,
        message:"logged in successfully",
        accessToken
      })
    }catch(e){
        console.log(e);
      res.status(500).json({
        success:false,
        message:"some error occured please try again"
      })
    }
};

const changePassword=async(req,res)=> {
  try {
    const  userId=req.userInfo.userId;

    // extract old annd new password
    const {oldPassword,newPassword}=req.body;
    //find the current logged in user
    const user=await User.findById(userId);
    
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }
    // check the old password is correct
    const isPasswordMatch=await bcrypt.compare(oldPassword,user.password);
    if(!isPasswordMatch){
      return res.status(400).json({
        success:false,
        message:"Your old password is not correct please try again"
      })
    }
    // hash the new password here
    const salt =await bcrypt.genSalt(10);
    const newHashedPassword=await bcrypt.hash(newPassword,salt);

    // update user password
    user.password=newHashedPassword;
    await user.save();

    res.status(200).json({
      success:true,
      message:"password changed successfully"
    });

  }catch(e){
    console.log(e)
    res.status(500).json({
      success:false,
      message :"some error occured ",

    })
  }
}
module.exports={loginUser,registerUser, changePassword};

