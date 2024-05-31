const helper = require("../../helper/helper");
const Plan = require("../../models/admin/planModel");
const uploadOnCloudinary = require("../../utils/cloudinary");

exports.createPlan = async (req, res) => {
    try {
        const { name, description, cost, planType, allocatedSpace,passwordLimit } = req.body;
        if (!name || !description || !cost || !planType || !allocatedSpace || !passwordLimit) {
            return res.status(400).json({
                success: false,
                message: "Enter all the fields"
            });
        }
        const oldplan = await Plan.findOne({ name });
        if (oldplan) {
            return res.status(400).json({
                success: false,
                message: "Plan Already Existed"
            });
        }
        const byteSpaceFormat=await helper.convertToBytes(allocatedSpace);

        // Create the plan
        const plan = await Plan.create({
            name, description, cost, planType, allocatedSpace:byteSpaceFormat,passwordLimit
        });
        const avatarLocalPath = req.files?.planImage[0]?.path;
        if (avatarLocalPath) {
            const avatar = await uploadOnCloudinary(avatarLocalPath)
            if (!avatar) {
                throw new ApiError(400, "Avatar file is required")
            }

            plan.planImage = avatar.url;
        }
        await plan.save();
        return res.status(201).json({
            success: true,
            message: "Plan Created Successfully",
            data: plan
        });
    } catch (err) {
        console.error('Error creating plan:', err.message);
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { description, cost, planType, allocatedSpace, passwordLimit } = req.body;
        const planId = req.params.id;

        let updateFields = {};

        if (description) updateFields.description = description;
        if (cost) updateFields.cost = cost;
        if (planType) updateFields.planType = planType;
        if (passwordLimit) updateFields.passwordLimit = passwordLimit;
        
        if (allocatedSpace) {
            const byteSpaceFormat = await helper.convertToBytes(allocatedSpace);
            updateFields.allocatedSpace = byteSpaceFormat;
        }

        const updatePlan = await Plan.findByIdAndUpdate(
            { _id: planId },
            { $set: updateFields },
            { new: true }
        );

        if (!updatePlan) {
            return res.status(401).json({
                success: false,
                message: "Plan not found",
            });
        }

        if (req.files && req.files.planImage) {
            const avatarLocalPath = req.files?.planImage[0]?.path;
            if (avatarLocalPath) {
                const avatar = await uploadOnCloudinary(avatarLocalPath);
                if (!avatar) {
                    throw new ApiError(400, "Avatar file is required");
                }
                updatePlan.planImage = avatar.url;
                await updatePlan.save(); 
            }
        }

        res.status(201).json({
            success: true,
            data: updatePlan,
            message: "Plan updated successfully",
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};


exports.deletePlan = async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await Plan.findByIdAndDelete(planId);
        if (!plan) {
            return res
                .status(404)
                .json({ success: false, error: "plan not found" });
        }
        res.status(201).json({ success: true, message: "plan Deleted Successfully", data: {} });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}

//Total Number Of Plans
exports.getAllPlan = async (req, res) => {
    try {
        const plan = await Plan.find();
        if (plan.length < 0) {
            return res.status(400).json({
                success: false,
                message: "No plan Exist"
            })
        }
        return res.status(201).json({
            success: true,
            totalplan: plan.length,
            data: plan
        })
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}

exports.getAPlan = async (req, res) => {
    try {
        const planId=req.params.id;
        const plan=await Plan.findById(planId);
        return res.status(201).json({
            success:true,
            data:plan
        })
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
}
