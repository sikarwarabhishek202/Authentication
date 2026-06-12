const cloudinary=require('../config/cloudinary');

const uploadToCloudinary=async(filePath)=>{
    try{
  const result =await cloudinary.uploader.upload(filePath);

  return{
    url:result.secure_url,
    publicId : result.public_id
  }
    }catch(err){
        console.log( 'Error while upploading  to cloudinary', err);
      throw new Error('Error while upploading  to cloudinary')
    }
}
module.exports={
    uploadToCloudinary
}