const express=require('express');
const {registerUser,loginUser,changePassword}=require('../controllers/auth-controller');
const router=express.Router();
const authMiddleware=require('../middleware/auth-middleware');


// all route are related to authentication 

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/changed-password',authMiddleware,changePassword);   


module.exports=router;