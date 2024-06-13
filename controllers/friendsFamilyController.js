const Plan=require("../models/admin/planModel");
const User=require("../models/user/userModel");
const helper = require("../helper/helper");
const { sendForgotPasswordEmail } = require("../utils/SendMail");
const { sendForgetPasswordOtp } = require("../utils/Twlio");

function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }
  
  function validatePhone(input) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(input);
  }

  exports.searchUser = async (req, res) => {
    try {
      const { emailorphone } = req.body;
      if (!emailorphone) {
        return res.status(400).json({
          success: false,
          message: "Email or phone number is required",
        });
      }
  
      // Validate email or phone format
      let isEmail = validateEmail(emailorphone);
      let isPhone = validatePhone(emailorphone);
  
      if (!isEmail && !isPhone) {
        return res.status(400).json({
          success: false,
          message: "Invalid Email or Phone number",
        });
      }
  
      // Check for existing user
      let existingUser;
      if (isEmail) {
        existingUser = await User.findOne({ email: emailorphone }).select('_id name mobile email');
      } else if (isPhone) {
        existingUser = await User.findOne({ mobile: emailorphone }).select('_id name mobile email');
      }
  
      if (existingUser) {
        return res.status(200).json({
          success: true,
          message: "User found",
          user: existingUser,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (err) {
      return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
  };

  exports.addUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const addUserId = req.params.id;
        const user = await User.findById(userId);
        const addUser = await User.findById(addUserId);
        
        if (!addUser) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Check for User Plan
        if (user.plan.planType === 'FREE') {
            return res.status(401).json({
                success: false,
                message: "You Are In free Plan Upgrade to Family Plan"
            });
        }

        const planId = user.plan.planId;
        const plan = await Plan.findById(planId);

         // Check if the user is already in the current user's family plan
         if (user.familyAndFriends.members.includes(addUserId)) {
            return res.status(409).json({
                success: false,
                message: "User is already in your family plan"
            });
        }

        if (plan.familyAndFriendsLimit <= user.familyAndFriends.total) {
            return res.status(401).json({
                success: false,
                message: "Your family Limit Exhausted"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        let isEmail = validateEmail(addUser.email);
        let isPhone = validatePhone(addUser.mobile);
        
        if (isEmail) {
            addUser.emailotp = otp;
            await addUser.save();
            await sendForgotPasswordEmail(addUser.email, otp, res);
        } else if (isPhone) {
            addUser.mobileotp = otp;
            await addUser.save();
            await sendForgetPasswordOtp(addUser.mobile, otp);
        }

        return res.status(201).json({
            success: true,
            message: "OTP sent to the user's email or mobile number"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};


exports.verifyOtpAndAddUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addUserId, otp } = req.body;
        const user = await User.findById(userId);
        const addUser = await User.findById(addUserId);

        if (!addUser) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        let isEmail = validateEmail(addUser.email);
        let isPhone = validatePhone(addUser.mobile);

        let validOtp = false;
        if (isEmail && addUser.emailotp === otp) {
            validOtp = true;
            addUser.emailotp = ""; // Clear OTP after verification
        } else if (isPhone && addUser.mobileotp === otp) {
            validOtp = true;
            addUser.mobileotp = ""; // Clear OTP after verification
        }
        
        if (!validOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Save addUser with cleared OTPs
        await addUser.save();

        // Check for User Plan and Limits
        if (user.plan.planType === 'FREE') {
            return res.status(401).json({
                success: false,
                message: "You Are In free Plan Upgrade to Family Plan"
            });
        }

        const planId = user.plan.planId;
        const plan = await Plan.findById(planId);

        if (plan.familyAndFriendsLimit <= user.familyAndFriends.total) {
            return res.status(401).json({
                success: false,
                message: "Limit Exhausted"
            });
        }

        // Save original plan details of addUser
        addUser.plan.originalPlan.planId = addUser.plan.planId;
        addUser.plan.originalPlan.planType = addUser.plan.planType;
        addUser.plan.originalPlan.expiresIn = addUser.plan.expiresIn;

        // Update addUser's plan to match the user's plan
        addUser.plan.planId = user.plan.planId;
        addUser.plan.planType = user.plan.planType;
        addUser.plan.createdIn = user.plan.createdIn;
        addUser.plan.expiresIn = user.plan.expiresIn;
        addUser.plan.usedSpace = user.plan.usedSpace;
        await addUser.save();

        // Add user to family and friends
        user.familyAndFriends.members.push(addUser._id);
        user.familyAndFriends.total += 1;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "User Added Successfully"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

exports.removeUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const removeUserId  = req.params.id;
        const user = await User.findById(userId);
        const removeUser = await User.findById(removeUserId);

        if (!removeUser) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Remove user from family and friends
        user.familyAndFriends.members = user.familyAndFriends.members.filter(
            member => member.toString() !== removeUserId
        );
        user.familyAndFriends.total -= 1;
        await user.save();

        // Revert the removed user's plan to original plan
        if(removeUser.plan.originalPlan.planType==='FREE')
            {
                removeUser.plan.planId = null;
                removeUser.plan.planType = removeUser.plan.originalPlan.planType;
                removeUser.plan.expiresIn = null;
                removeUser.plan.originalPlan = { planId: null, planType: "FREE", expiresIn: null }
            }
        else if (removeUser.plan.originalPlan.planId) {
            removeUser.plan.planId = removeUser.plan.originalPlan.planId;
            removeUser.plan.planType = removeUser.plan.originalPlan.planType;
            removeUser.plan.expiresIn = removeUser.plan.originalPlan.expiresIn;
            removeUser.plan.originalPlan = { planId: null, planType: null, expiresIn: null }; 
                
        }
        await removeUser.save();

        return res.status(200).json({
            success: true,
            message: "User Removed Successfully"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

