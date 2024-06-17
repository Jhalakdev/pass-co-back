const User = require("../models/user/userModel");
const helper = require("../helper/helper");
const HashManager = require("../utils/HashManager");
const { sendForgotPasswordEmail } = require("../utils/SendMail");
const { sendForgetPasswordOtp } = require("../utils/Twlio");
const uploadOnCloudinary = require("../utils/cloudinary");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('724294467494-qu06qgv3f5nmai710jtsqpiiurj015ts.apps.googleusercontent.com');


function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

function validatePhone(input) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(input);
}

const generateAccessAndRefereshTokens = async (_id) => {
  try {
    const user = await User.findById({ _id });
    const accessToken = user.generateAccessToken();
    user.token = accessToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    console.log(error);
  }
};

// Register A User
exports.signupUser = async (req, res) => {
  try {
    const { name, emailorphone, password, terms } = req.body;

    if (!name || !emailorphone || !password || !terms) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
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
      existingUser = await User.findOne({ email: emailorphone });
    } else if (isPhone) {
      existingUser = await User.findOne({ mobile: emailorphone });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await HashManager.generate(password);

    // Verify email or phone
    if (isEmail) {
      await helper.verify.verifyEmail(emailorphone);
    } else if (isPhone) {
      await helper.verify.verifyPhone(emailorphone);
    }
    // Create user in MongoDB
    const user = await User.create({
      name,
      email: isEmail ? emailorphone : null,
      mobile: isPhone ? emailorphone : null,
      password: hashedPassword,
      terms: true,
    });

    const { accessToken } = await generateAccessAndRefereshTokens(user._id);

    const cookieOptions = {
      path: "/",
      // expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    const userData = { ...user.toObject({ getters: true }) };
    delete userData.password;
    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .json({
        success: true,
        accessToken,
        data: userData,
        message: "Signed Up Successfully",
      });
  } catch (error) {
    return helper.sendError(
      error.statusCode || 500,
      res,
      { error: error.message },
      req
    );
  }
};

// Login A User
exports.loginUser = async (req, res) => {
  try {
    const { emailorphone, password } = req.body;

    const isEmail = validateEmail(emailorphone);
    const isPhone = validatePhone(emailorphone);

    if (!isEmail && !isPhone) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Phone Number",
      });
    }

    const user = isEmail
      ? await User.findOne({ email: emailorphone })
      : await User.findOne({ mobile: emailorphone });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: isEmail ? "Email Not Found" : "Mobile Number Not Found",
      });
    }

    const isMatch = await HashManager.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Login Credentials",
      });
    }
    if(user.isBlocked)
      {
        return res.status(400).json({
          success:false,
          message:"You are no longer to continue...Contact Admin"
        })
      }
    const { accessToken } = await generateAccessAndRefereshTokens(user._id);

    const cookieOptions = {
      path: "/",
      // expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    const userData = { ...user.toObject({ getters: true }) };
    delete userData.password;
    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .json({
        success: true,
        accessToken,
        data: userData,
        message: "User Login Success",
      });
  } catch (err) {
    return helper.sendError(
      err.statusCode || 500,
      res,
      { error: err.message },
      req
    );
  }
};


//Logout A User
exports.logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          token: ""
        }
      },
      {
        new: true
      }
    )

    const options = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }

    return res
      .status(201)
      .clearCookie("accessToken", options)
      .json({
        success: true,
        data: {},
        message: "User logged Out Successfully"
      })
  } catch (err) {
    return sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

//Forget Password
exports.forgetPassword = async (req, res) => {
  try {
    const { emailorphone } = req.body;
    const isEmail = validateEmail(emailorphone);
    const isPhone = validatePhone(emailorphone);

    if (!isEmail && !isPhone) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Phone Number",
      });
    }

    const user = isEmail
      ? await User.findOne({ email: emailorphone })
      : await User.findOne({ mobile: emailorphone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: isEmail ? "Email Not Found" : "Mobile Number Not Found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    if (isEmail) {
      user.emailotp = otp;
      await user.save();
      await sendForgotPasswordEmail(emailorphone, otp, res);
    } else {
      user.mobileotp = otp
      await user.save();
      await sendForgetPasswordOtp(emailorphone, otp);
      return res.status(201).json({
        message: "Otp send to your mobile number"
      })
    }
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

//resend Otp


//Verify Email or phoneotp for forget Password

exports.verfyemailorphonecode = async (req, res) => {
  try {
    const { emailorphone, otp } = req.body;
    const isEmail = validateEmail(emailorphone);
    const isPhone = validatePhone(emailorphone);

    if (!isEmail && !isPhone) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Phone Number",
      });
    }

    const user = isEmail
      ? await User.findOne({ email: emailorphone })
      : await User.findOne({ mobile: emailorphone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: isEmail ? "Email Not Found" : "Mobile Number Not Found",
      });
    }
    if (isEmail) {
      if (user.emailotp === otp) {
        user.emailotp = "";
        await user.save()
        return res.status(201).json({
          success: true,
          message: "Otp Verified"
        })
      } else {
        return res.status(400).json({
          success: true,
          message: "Incorrect Otp"
        })
      }
    } else {
      if (user.mobileotp === otp) {
        user.mobileotp = "";
        await user.save()
        return res.status(201).json({
          success: true,
          message: "Otp Verified"
        })
      } else {
        return res.status(400).json({
          success: true,
          message: "Incorrect Otp"
        })
      }
    }
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { emailorphone, password, cpassword } = req.body;
    const isEmail = validateEmail(emailorphone);
    const isPhone = validatePhone(emailorphone);

    if (!isEmail && !isPhone) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Phone Number",
      });
    }

    if (password === cpassword) {
      const user = isEmail
        ? await User.findOne({ email: emailorphone })
        : await User.findOne({ mobile: emailorphone });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: isEmail ? "Email Not Found" : "Mobile Number Not Found",
        });
      }
      const oldpassword = await HashManager.compare(password, user.password);
      if (oldpassword) {
        return res.status(400).json({
          success: false,
          message: "Create New password"
        })
      }
      const hashedpassword = await HashManager.generate(password);

      const userUpdate = await User.findByIdAndUpdate(
        { _id: user._id },
        { password: hashedpassword }
      );
      res.status(201).json({
        success: true,
        message: "Password reset Successfully"
      });
    }
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

//chnage password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const { currentpassword, password, cpassword } = req.body;
    if (password === cpassword) {
      const oldpassword = await HashManager.compare(currentpassword, user.password);
      if (oldpassword) {
        if(currentpassword===password)
          {
            return res.status(400).json({
              success:false,
              message:"You are Entering the same password for change"
            })
          }
        const hashedpassword = await HashManager.generate(password);

        const userUpdate = await User.findByIdAndUpdate(
          { _id: user._id },
          { password: hashedpassword }
        );
        res.status(201).json({
          success: true,
          message: "Password Changed Successfully"
        });
      }else{
        return res.status(400).json({
          success:false,
          message:"Current password is wrong"
        })
      }
    }else{
      return res.status(400).json({
        succes:false,
        message:"Password and Confirm Password Not Matched"
      })
    }
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

exports.updateProfileImage=async(req,res)=>{
  try{
    const user=await User.findById(req?.user?._id);
    if(req.files && req.files.image)
      {
        const avatarLocalPath = req.files?.image[0]?.path;
        if(avatarLocalPath){
          const avatar = await uploadOnCloudinary(avatarLocalPath)
          if (!avatar) {
            throw new ApiError(400, "Avatar file is required")
          }
          user.profilePhoto = avatar.url;
        }
      }
      await user.save();
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(201).json({
        success: true,
        data: user.profilePhoto,
        message: "User Profile updated successfully",
      });
  }catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}


exports.getUser=async(req,res)=>{
  try{
    const userId=req?.user?._id;
    const user=await User.findById(userId).select('name email mobile profilePhoto isBlocked fileshare plan passwordStorage token fcmToken');
    if(!user)
      {
        return res.status(401).json({
          succes:false,
          message:"Invalid Route"
        })
      }
      return res.status(201).json({
        succes:true,
        data:user
      })
  }catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}

exports.googelLogin=async(req,res)=> {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '724294467494-qu06qgv3f5nmai710jtsqpiiurj015ts.apps.googleusercontent.com',
  });

  const payload = ticket.getPayload();
  const {name,email,sub,picture}=payload;
    const uid=sub;

    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({
        name,
        email,
        uid,
        profilePhoto: picture,
      });
      await user.save();
    }

    const { accessToken } = await generateAccessAndRefereshTokens(user._id);

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .json({
        success: true,
        accessToken,
        data: user,
        message: "User Login Success",
      });
  } catch (err) {
    return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
  }
}  


