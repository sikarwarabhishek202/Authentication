const express =require ('express');
const router=express.Router()
const authMiddleware =require('../middleware/auth-middleware');
const uploadMiddleware=require('../middleware/upload-middleware');
const{ uploadImageController, fetchImagesController,deleteImageController } = require('../controllers/image-controller')
// upload the image 
router.post('/upload',authMiddleware,uploadMiddleware.single('image'),uploadImageController)

// to get all the image 
router.get('/get',authMiddleware,fetchImagesController);
// to delete image router
// 6a1fd399b3d786a642291af4
router.delete('/:id',authMiddleware,deleteImageController);
module.exports=router