const express=require('express');
const router=express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');

router.get('/welcome', authMiddleware, adminMiddleware, (req,res)=>{
    res.json({
        success: true,
        message: `Welcome to the Admin Panel, ${req.userInfo.username}!`,
        user: req.userInfo
    })
})

module.exports=router;