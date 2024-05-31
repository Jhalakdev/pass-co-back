const Admin=require("../../models/admin/adminUser")
const helper = require("../../helper/helper");
const HashManager = require("../../utils/HashManager");
const { sendForgotPasswordEmail } = require("../../utils/SendMail");

const generateAccessAndRefereshTokens = async (_id) => {
  try {
    const user = await Admin.findById({ _id });
    const adminToken = user.generateAccessToken();
    user.token = adminToken;
    await user.save({ validateBeforeSave: false });

    return { adminToken };
  } catch (error) {
    console.log(error);
  }
};

// Register Admin
exports.signupAdmin = async (req, res) => {
  try {
    const {  email, password } = req.body;

    if (!email || !password ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Validate email format
    await helper.verify.verifyEmail(email,"ADMIN");

      const existingUser = await Admin.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await HashManager.generate(password);
    // Create user in MongoDB
    const user = await Admin.create({
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
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
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password ) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields",
        });
      }

    // await helper.verify.verifyEmail(email,"ADMIN");

    const admin =await Admin.findOne({email})
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      });
    }

    const isMatch = await HashManager.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Login Credentials",
      });
    }

    const { adminToken } = await generateAccessAndRefereshTokens(admin._id);

    const cookieOptions = {
      path: "/",
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    const userData = { ...admin.toObject({ getters: true }) };
    delete userData.password;
    return res
      .status(201)
      .cookie("adminToken", adminToken, cookieOptions, { maxAge: 86400000 })
      .json({
        success: true,
        adminToken,
        data: userData,
        message: "Admin Login Success",
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
    await Admin.findByIdAndUpdate(
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
      .clearCookie("adminToken", options)
      .json({
        success: true,
        data: {},
        message: "Admin logged Out Successfully"
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
      ? await Admin.findOne({ email: emailorphone })
      : await Admin.findOne({ mobile: emailorphone });
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
      ? await Admin.findOne({ email: emailorphone })
      : await Admin.findOne({ mobile: emailorphone });
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
        ? await Admin.findOne({ email: emailorphone })
        : await Admin.findOne({ mobile: emailorphone });
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

      const userUpdate = await Admin.findByIdAndUpdate(
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
    const user = await Admin.findById(userId);
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

        const userUpdate = await Admin.findByIdAndUpdate(
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
