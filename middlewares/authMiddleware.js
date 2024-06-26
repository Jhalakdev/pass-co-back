const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User=require("../models/user/userModel")
const Admin=require("../models/admin/adminUser")
dotenv.config();

exports.userAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.cookies?.adminToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {

          return res.status(401).json({
			succes:false,
			message:"Invalid Authorization,Token Not Found"
		  });
  } else {
      await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
			return res.status(401).json({
				succes:false,
				message:"Invalid Authorization,Token Not Found"
			  });
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

exports.verifyToken = async (req, res, next) => {
	const token = req.cookies?.accessToken || req.cookies?.adminToken || req.header("Authorization")?.replace("Bearer ", "");
	if (!token) {
  
			return res.status(401).json("Invalid Authorization,Token Not Found");
	} else {
		await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
			if (err) {
				return res.status(401).json({
					success:false,
					message:"Invalid Token or Token Expire"
				})
			} else {
				return res.status(201).json({
					success:true,
					message:"Valid Token"
				})
			}
		});
	}
  };