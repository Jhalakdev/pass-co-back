const mongoose=require("mongoose")

const passKeyModel=new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    companyName:{
       type:String
    },
    username:{
        type:String,
        require:true,
        trim:true,
    },
    email:{
        type:String,
        require:true,
        trim:true,
    },
    password:{
        type:String,
        require:true
    },
    notes:{
        type:String,
    }
})

module.exports=mongoose.model("PassKey",passKeyModel)