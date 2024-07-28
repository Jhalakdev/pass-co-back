const Coupen = require("../../models/admin/coupenModel");
const helper = require("../../helper/helper");
const Plan = require("../../models/admin/planModel");

// Create Coupons
exports.createCoupen = async (req, res) => {
  try {
    const { name, expireIn, discount, planId, usageLimit } = req.body;
    if (!name || !expireIn || !discount || !usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Enter all the fields",
      });
    }

    const plan = await Plan.findById(planId);
    const coupen = await Coupen.create({
      name,
      discount,
      plan: plan.name,
      usageLimit,
    });
    await coupen.setExpire(expireIn);
    await coupen.save();

    return res.status(201).json({
      success: true,
      message: "Coupen Created Successfully",
      coupen,
    });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

// Update Coupons
exports.updateCoupen = async (req, res) => {
  try {
    const { name, discount, planId, expireIn, usageLimit } = req.body;
    const coupenId = req.params.id;
    const coupen = await Coupen.findById(coupenId);

    if (!coupen) {
      return res.status(401).json({
        success: false,
        message: "Coupon Not found",
      });
    }

    if (name) coupen.name = name;
    if (discount) coupen.discount = discount;
    if (usageLimit) coupen.usageLimit = usageLimit;
    if (planId) {
      const plan = await Plan.findById(planId);
      coupen.plan = plan.name;
    }
    if (expireIn) await coupen.setExpire(expireIn);

    await coupen.save();

    return res.status(201).json({
      success: true,
      message: "Coupon Updated successfully",
      coupen,
    });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

// Delete Coupon
exports.deleteCoupen = async (req, res) => {
  try {
    const coupenId = req.params.id;
    const coupen = await Coupen.findByIdAndDelete(coupenId);

    if (!coupen) {
      return res.status(401).json({
        success: false,
        message: "Coupon Not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Coupen deleted successfully",
    });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

// Get a Coupon
exports.getACoupen = async (req, res) => {
  try {
    const coupenId = req.params.id;
    const coupen = await Coupen.findById(coupenId);

    if (!coupen) {
      return res.status(400).json({
        success: false,
        message: "Coupen Not Found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Coupen Found",
      coupen,
    });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

// Get All Coupons
exports.getAllCoupen = async (req, res) => {
  try {
    const currentDate = new Date();
    const coupens = await Coupen.find({
      expiryIn: { $gt: currentDate },
      usageLimit: { $gt: 0 },
    });

    if (!coupens || coupens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid or active coupons found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Coupons Found",
      coupens,
    });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}
