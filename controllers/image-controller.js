const Image=require('../models/Image');
const {uploadToCloudinary}=require('../helper/cloudinaryHelper');
const fs =require('fs');
const cloudinary=require('../config/cloudinary')

const uploadImageController = async(req,res)=>{
    try{
        //if file is missing in req objct
        if(!req.file){
            return res.status(400).json({
                success:false,
                message: "file is required ! please upload a image"
            })
        }
        // upload cloudinary
       const {url,publicId}=await uploadToCloudinary(req.file.path)

       // store the image url and public id along with the uploaded user id in database 
       const newlyUploadedImage=new Image({
        url,
        publicId,
        uploadBy : req.userInfo.userId
       })
       await newlyUploadedImage.save();

       // delete the filefrom the local storage
       fs.unlinkSync(req.file.path);

       res.status(201).json({
        success:true ,
        message:'Image Uploaded ',
        image : newlyUploadedImage
       })

    }catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:"something goes Wrong please Try again "
        })
    }

}
const fetchImagesController = async(req,res)=>{
    try{
    const images=await Image.find({})
        if(images){
            res.status(201).json({
                success:true,
                data:images
            });
        }
    
    }catch(e){
        console.log(e);
        res.status(500).json({
            success:false,
            message:"something goes Wrong please Try again "
        })
    }
}
const deleteImageController=async(req,res)=>{
    try{
        const getCurrentIdOfImageToBeDeleted=req.params.id;
        const userId=req.userInfo.userId;
        const image =await Image.findById(getCurrentIdOfImageToBeDeleted);

        if(!image){
            return res.status(404).json({
                success:false,
                message:'Image not found'
            })
        }
        // check if the image is uploaded by current user who is trying to to delet this image 
        console.log(image.uploadBy.toString());
        if(image.uploadBy.toString()!==userId){
            return res.status(403).json({
                success:false,
                message:'You are not authorized to delete this Image because you have not uploaded it'
            })
        }
        //delete this image from cloudinary storage
        await cloudinary.uploader.destroy(image.publicId);

        // now delete from mongodb database
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);

        res.status(200).json({
            success:true,
            message:"Image deleted successfully"
        })

    }catch(e){
        console.log(e);
        res.status(500).json({
            success:false,
             message:"something went wrong ! please try again"
        })
    }
}
module.exports={
    uploadImageController,
    fetchImagesController,
    deleteImageController
}