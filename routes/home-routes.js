const express=require('express');
const authMiddleware=require('../middleware/auth-middleware')
const router=express.Router()

router.get('/welcome',authMiddleware,(req,res)=>{  // middleware run first before the response
    const {username,userId,role}=req.userInfo;
    res.json({
        message:"Welcome to the Home Page",
        user:{
            _id:userId,
            username,
            role
        }
    })
});
module.exports=router;