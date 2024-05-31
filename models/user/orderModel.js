const mongoose=require("mongoose")

const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    planId:{
        type:mongoose.Types.ObjectId,
        ref:"Plan"
    },
    amount:{
        type:String,
    },
    currency:{
        type:String,
    },
    paymentStatus:{
        type:String,
        enum:['pending','completed','failed']
    },
    paymentMethod:{
        type:String
    },
    transactionId:{
        type:String
    }
},{timestamps:true})


module.exports=mongoose.model("Order",orderSchema)