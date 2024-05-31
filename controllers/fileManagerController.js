const helper = require("../helper/helper");
const Plan = require("../models/admin/planModel");
const File=require("../models/user/fileModel");
const User = require("../models/user/userModel");

exports.getMyFileManager=async(req,res)=>{
    try{
        const userId=req.user._id;
        const user=await User.findById(userId);
        if(user.fileshare)
            {
                const plan=await Plan.findById(user.plan.planId);
                const files=await File.findOne({userId});
                const usedSpace=user.plan.usedSpace;
                const allocatedSpace=await helper.formatFileSize(plan.allocatedSpace);
                return res.status(201).json({
                    succes:true,
                    usedSpace,
                    allocatedSpace,
                    file:files.file
                })
            }
        else{
            return res.status(400).json({
                succes:false,
                message:"You Are in FREE Plan Upgrade it to use File Manager"
            })
        }
        
    }catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
      }
}