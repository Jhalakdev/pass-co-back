const helper = require("../../helper/helper");
const User=require("../../models/user/userModel")

exports.blockUser=async(req,res)=>{
    try{
    const userId=req.body.userId
    const user=await User.findById(userId);
    user.isBlocked=true;
    await user.save();
    return res.status(201).json({
        success:true,
        message:"User Blocked Successfully"
    })
    }catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

exports.unblockUser=async(req,res)=>{
    try{
        const userId=req.body.userId
        const user=await User.findById(userId);
        user.isBlocked=false;
        await user.save();
        return res.status(201).json({
            success:true,
            message:"User Un-Blocked Successfully"
        })
    }catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

exports.getAllUser=async(req,res)=>{
  try{
    const user=await User.find().select('-password');
    if(user.length<=0)
      {
        return res.status(400).json({
          success:false,
          message:"No user Exist",
          data:[]
        })
      }
      return res.status(201).json(
       { success:false,
        data:user}
      )
  }catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

exports.getAUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch the user along with family and friends
    const user = await User.findById(userId).select('-password').populate({
      path: 'familyAndFriends.members',
      select: '_id name plan'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null
      });
    }

    // Fetch the user's payment history
    const paymentHistory = await Order.find({ _id: { $in: user.paymentHistory.map(ph => ph.orderId) } });

    return res.status(200).json({
      success: true,
      message: "User found",
      data: { 
        user, 
        paymentHistory 
      }
    });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
};

exports.getAllOrder=async(req,res)=>{
  try{
    const order=await Order.find();
    if(!order)
      {
        return res.status(400).json({
          succes:false,
          message:"No Order"
        })
      }
      return res.status(201).json({
        succes:true,
        totalOrder:order.length,
        order
      })
  }catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}