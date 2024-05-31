const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User=require("../models/user/userModel")
const Admin=require("../models/admin/adminUser")
dotenv.config();

exports.userAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.cookies?.adminToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {

          return res.json("Invalid Authorization");
  } else {
      await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
              console.log("Invalid Token");
          } else {
              req.user = decoded;
              next();
          }
      });
  }
};


exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await Admin.findOne({ _id:req.user._id });
		if (userDetails.role !== "ADMIN") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};