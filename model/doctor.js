const mongoose=require("mongoose")
const  userSchema= mongoose.Schema({
    providerId:{
        type:String,
        required:false
    },
    providerName:{
        type:String,
        required:false
    },
    providerSpeciality:{
        type:String,
        required:false
    },
    contactNo:{
        type:Number,
        required:false
    }
},{versionKey:false})



const  userModel=mongoose.model('doctorDetails',userSchema)

module.exports=userModel