const User=require("../models/user/userModel")
const CustomError = require('../models/CustomError');
const Admin = require("../models/admin/adminUser");
// const TokenManager = require('../utils/TokenManager');


module.exports = {
	sendError: async function (error_code, res, text, req) {
		res.status(error_code).send({
			action: req.originalUrl,
			code: error_code,
			status: false,
			data: text,
			message: text,
		});
	},
	sendSuccess: function (res, text, req, message = '') {
		res.status(200).send({
			action: req.originalUrl,
			code: 200,
			status: true,
			data: text,
			message: message,
		});
	},
	verify: {
		verifyEmail: async function (email, role) {
			console.log(role)
			try {
				const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

				if (!email) throw new CustomError(400, 'Enter an email');
				if (!emailRegex.test(email)) throw new CustomError(400, 'Invalid email');
				let checkEmail;
				if(role==="ADMIN"){
					 checkEmail = await Admin.findOne({ email });
				}else if(role==="undefined"){
					 checkEmail = await User.findOne({ email });
				}
				
				if (checkEmail) throw new CustomError(409, 'Email already registered');
			} catch (err) {
				console.log(err);
				throw err;
			}
		},
		verifyPhone: async function (mobile) {
			try {
				if (!mobile) throw new CustomError(400, 'Enter a mobile number');

				const phoneRegex = /^(?:\+\d{1,3})?[1-9]\d{9}$/;
				if (!phoneRegex.test(mobile)) {
					throw new CustomError(400, 'Invalid mobile number');
				}
			} catch (err) {
				console.log(err);
				throw err;
			}
		},
		verifyDob: async function (dob) {
			try {
				if (!dob) throw new CustomError(400, 'Enter a date of birthday');

				const age = new Date().getFullYear() - new Date(dob).getFullYear();
				if (age < 18) throw new CustomError(401, 'You must be 18 years old');

				return age;
			} catch (err) {
				console.log(err);
				throw err;
			}
		},
	},
	// validateUser: {
	// 	byId: async function (id, hide) {
	// 		try {
	// 			if (!id || id === ':id') throw new CustomError(400, 'Enter the user id');

	// 			let user;
	// 			if ((hide = true)) {
	// 				user = await User.findById(id)
	// 					.select('-password -fcmToken -resetToken -verifyToken -__v -bookings -paymentHistory')
	// 					.exec();
	// 			} else {
	// 				user = await User.findById(id).exec();
	// 			}

	// 			if (!user) throw new CustomError(404, 'User not found');
	// 			return user;
	// 		} catch (err) {
	// 			console.log(err);
	// 			throw err;
	// 		}
	// 	},
	// 	byToken: async function (token, hide) {
	// 		try {
	// 			if (!token) throw new CustomError(400, 'Log in first');

	// 			const { user_id } = await TokenManager.verify(token);

	// 			let user;
	// 			if ((hide = true)) {
	// 				user = await User.findById(user_id)
	// 					.select('-password -fcmToken -resetToken -verifyToken -__v -bookings -paymentHistory')
	// 					.exec();
	// 			} else {
	// 				user = await User.findById(user_id).exec();
	// 			}

	// 			if (!user) throw new CustomError(404, 'User not found, log in again');

	// 			return user;
	// 		} catch (err) {
	// 			console.log(err);
	// 			throw err;
	// 		}
	// 	},
	// 	byEmail: async function (email) {
	// 		try {
	// 			if (!email) throw new CustomError(400, 'Enter the user email');

	// 			const user = await User.findOne({ email }).exec();
	// 			if (!user) throw new CustomError(404, 'User not found');

	// 			return user;
	// 		} catch (err) {
	// 			console.log(err);
	// 			throw err;
	// 		}
	// 	},
	// 	byPhone: async function (phone) {
	// 		try {
	// 			if (!phone) throw new CustomError(400, 'Enter the user phone');

	// 			const user = await User.findOne({ mobile: phone }).exec();
	// 			if (!user) throw new CustomError(404, 'User not found');

	// 			return user;
	// 		} catch (err) {
	// 			console.log(err);
	// 			throw err;
	// 		}
	// 	},
	// },
	validateEmail:async function(input) {
		const emailRegex =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(input);
	},
	 validatePhone: async function(input) {
		const phoneRegex = /^\+?[1-9]\d{1,14}$/;
		return phoneRegex.test(input);
	},
	verifyUrl:async function(url)
	{
		const pattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
  
		// Match the URL against the pattern
		const match = url.match(pattern);
		
		// Ensure the URL ends with the required domain extensions
		const validExtensions = ['.com', '.in', '.org','.gov','.net','.edu','.int'];
		if (match) {
		  for (let ext of validExtensions) {
			if (url.endsWith(ext)) {
			  return true;
			}
		  }
		}
		
		return false;
	},
	addTimeToDate:async function(date, type, value) {
		const newDate = new Date(date);
		if (type === 'month') {
			newDate.setMonth(newDate.getMonth() + value);
		} else if (type === 'year') {
			newDate.setFullYear(newDate.getFullYear() + value);
		}
		return newDate.toISOString().split('T')[0];
	},
	 convertToBytes:async function(input) {
		const units = {
			TB: 1099511627776,
			GB: 1073741824,
			MB: 1048576,
			KB: 1024,
			B: 1
		};
	
		const regex = /([\d.]+)\s*(TB|GB|MB|KB|B)/i;
		const match = input.match(regex);
	
		if (!match) {
			throw new Error("Invalid input format. Please use the format '<value> <unit>' (e.g., '1 MB').");
		}
	
		const value = parseFloat(match[1]);
		const unit = match[2].toUpperCase();
	
		if (!units[unit]) {
			throw new Error("Unknown unit. Please use one of TB, GB, MB, KB, or B.");
		}
	
		const bytes = value * units[unit];
		return bytes;
	},
	 formatFileSize : async function(bytes) {
		const KB = 1024;
		const MB = KB * 1024;
		const GB = MB * 1024;
		const TB = GB * 1024;
	
		if (bytes >= TB) {
			return (bytes / TB).toFixed(2) + ' TB';
		} else if (bytes >= GB) {
			return (bytes / GB).toFixed(2) + ' GB';
		} else if (bytes >= MB) {
			return (bytes / MB).toFixed(2) + ' MB';
		} else if (bytes >= KB) {
			return (bytes / KB).toFixed(2) + ' KB';
		} else {
			return bytes + ' B';
		}
	}
};
