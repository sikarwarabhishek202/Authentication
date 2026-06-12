const mongoose=require('mongoose');
const dns=require('dns');

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const connectToDB=async()=>{
    try{
      await mongoose.connect(process.env.MONGO_URI);
      console.log("mongoDB connected Successfully");
    }catch(e){
        console.error("mongo DB Connection Failed");
        process.exit(1);
    }
}

module.exports=connectToDB;