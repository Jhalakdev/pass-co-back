const Coupen=require("../../models/admin/coupenModel");
const helper=require("../../helper/helper")
const Plan=require("../../models/admin/planModel")
//Create Coupens
exports.createCoupen=async(req,res)=>{
    try{
        const {name,expireIn,discount,planId}=req.body
        if(!name || !expireIn || !discount)
            {
                return res.status(400).json({
                    success:false,
                    message:"Enter all the fields"
                })
            }
      const plan=await Plan.findById(planId)
      const coupen=await Coupen.create({
        name,discount,plan:plan.name
      });
      await coupen.setExpire(expireIn);
      await coupen.save();
      return res.status(201).json({
        success:true,
        message:"Coupen Created Successfully",
        coupen
      })
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}

//Update Coupens
exports.updateCoupen=async(req,res)=>{
  try{
    const {name,discount,planId,expireIn}=req.body;
    const coupenId=req.params.id;
    const coupen=await Coupen.findByIdAndUpdate(coupenId,{name,discount},{new:true});
    if(planId){
      const plan= await Plan.findById(planId);
      coupen.plan=plan.name;
    }
  }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}

//delete coupen
exports.deleteCoupen=async(req,res)=>{
  try{
    const coupenId=req.params.id;
    const coupen=await Coupen.findByIdAndDelete(coupenId);
    return res.status(201).json({
      success:true,
      message:"Coupen deleted successfully"
    })
  }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}

//get a coupen

exports.getACoupen=async(req,res)=>{
  try{
    const coupenId=req.params.id;
    const coupen=await Coupen.findByIdAndDelete(coupenId);
    if(!coupen)
      {
        return res.status(400).json({
          success:false,
          message:"Coupen Not Found"
        })
      }
      return res.status(201).json({
        succss:true,
        message:"Coupen Found",
        coupen
      })
  }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}

// get All Coupen 
exports.getAllCoupen=async(req,res)=>{
  try{
    const coupen=await Coupen.find();
    if(!coupen)
      {
        return res.status(400).json({
          success:false,
          message:"Coupen Not Found"
        })
      }
      return res.status(201).json({
        succss:true,
        message:"Coupen Found",
        coupen
      })
  }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}