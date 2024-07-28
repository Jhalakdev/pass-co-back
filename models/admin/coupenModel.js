const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  plan:{
   type:String,
  },
  expiryIn: {
    type: Date,
  },
  discount: {
    type: Number,
    required: true,
  },
  usageLimit:{
    type:Number,
    required:true
  },
  usageCount:{
    type:Number,
    default:0
  }
},{timestamps:true});

couponSchema.methods.setExpire =async function(days) {
  const now = new Date();
  const expiresInDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); 

  this.expiryIn = expiresInDate;
};


module.exports = mongoose.model("Coupon", couponSchema);
