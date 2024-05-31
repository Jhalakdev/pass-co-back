const mongoose=require("mongoose")

const fileSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    file:[{
        type:String,
        required:true
    }],

},{timestamps:true})

module.exports=mongoose.model("File",fileSchema)