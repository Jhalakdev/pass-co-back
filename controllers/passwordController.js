const helper = require("../helper/helper");
const Plan = require("../models/admin/planModel");
const User = require("../models/user/userModel");
const PassKey = require("../models/user/passKeysModel");
const Company = require("../models/admin/companyModel");
const HashManager = require("../utils/HashManager");
const mongoose=require("mongoose")

exports.createPassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { companyId, username, email, password, notes } = req.body;

        if (!companyId || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Enter All The fields"
            });
        }

        const companyExist = await Company.findById(companyId);
        if (!companyExist) {
            return res.status(400).json({
                success: false,
                message: "Company Not Found"
            });
        }

        if (!helper.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter valid email format"
            });
        }

        const user = await User.findById(userId);
        const plan = await Plan.findById(user.plan.planId);

        if (user.passwordStorage.total >= plan.passwordLimit) {
            return res.status(400).json({
                success: false,
                message: "Your Password Limit is exceeded. Switch to Another Plan."
            });
        }

        const hashedPassword = await HashManager.encrypt(password);
        const passwordStorage = await PassKey.create({
            userId,
            companyName: companyExist.name,
            username,
            email,
            password: hashedPassword,
            notes
        });

        user.passwordStorage.storage.push(passwordStorage._id);
        user.passwordStorage.total += 1;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Password Stored Successfully"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const passwordId=req.params.id;
        const {companyId, username, email, password, notes } = req.body;

        const passwordStorage = await PassKey.findById(passwordId);
        if (!passwordStorage) {
            return res.status(404).json({
                success: false,
                message: "Password Not Found"
            });
        }

        const companyExist = await Company.findById(companyId);
        if (!companyExist) {
            return res.status(400).json({
                success: false,
                message: "Company Not Found"
            });
        }

        if (email && !helper.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter valid email format"
            });
        }

        passwordStorage.companyName = companyExist.name;
        passwordStorage.username = username;
        passwordStorage.email = email;
        if (password) {
            passwordStorage.password = await HashManager.encrypt(password);
        }
        passwordStorage.notes = notes;
        await passwordStorage.save();

        return res.status(200).json({
            success: true,
            message: "Password Updated Successfully"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

exports.deletePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const passwordId  = req.params.id;

        const user = await User.findById(userId);
        const passwordStorage = await PassKey.findByIdAndDelete(passwordId);

        if (!passwordStorage) {
            return res.status(404).json({
                success: false,
                message: "Password Not Found"
            });
        }

        user.passwordStorage.storage = user.passwordStorage.storage.filter(id => id.toString() !== passwordId);
        user.passwordStorage.total -= 1;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Deleted Successfully"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

exports.getSinglePassword = async (req, res) => {
    try {
        const  passwordId  = req.params.id;
        const passwordStorage = await PassKey.findById(passwordId);

        if (!passwordStorage) {
            return res.status(404).json({
                success: false,
                message: "Password Not Found"
            });
        }

        const decryptedPassword = await HashManager.decrypt(passwordStorage.password);
        const company=await Company.findOne({name:passwordStorage?.companyName});
        return res.status(200).json({
            success: true,
            data: {
                ...passwordStorage.toObject(),
                password: decryptedPassword,
                comapany:company
            }
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};


exports.getAllPasswords = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('passwordStorage.storage');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        const decryptedPasswords = await Promise.all(user.passwordStorage.storage.map(async (item) => {
            const companyLogo = await Company.findOne({ name: item.companyName });
            const image = companyLogo ? companyLogo.image : null;
            const decryptedPassword = await HashManager.decrypt(item.password); // Assuming decrypt is an async function

            return {
                ...item._doc, // spread the original document
                password: decryptedPassword,
                image
            };
        }));

        return res.status(200).json({
            success: true,
            data: decryptedPasswords
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};

exports.searchPasswords = async (req, res) => {
    try {
        const userId = req.user._id;
        const { companyName, username, email } = req.query;

        // Initialize the query object
        const query = {
            userId: new mongoose.Types.ObjectId(userId),
        };
        // Add optional filters
        if (companyName) query.companyName = { $regex: companyName, $options: "i" };
        if (username) query.username = { $regex: username, $options: "i" };
        if (email) query.email = { $regex: email, $options: "i" };

        const passwords = await PassKey.find(query).exec();

        return res.status(200).json({
            success: true,
            data: passwords,
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};


exports.exportPasswords = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('passwordStorage.storage');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Encrypt each field in each password object
        const encryptedPasswords = await Promise.all(user.passwordStorage.storage.map(async item => {
            return {
                companyName: await HashManager.encrypt(item.companyName),
                username: await HashManager.encrypt(item.username),
                email: await HashManager.encrypt(item.email),
                password: item.password,  // Password is already encrypted
                notes: await HashManager.encrypt(item.notes),
                
            };
        }));

        return res.status(200).json({
            success: true,
            passwords: encryptedPasswords
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};


exports.importPasswords = async (req, res) => {
    try {
        const userId = req.user._id;
        const { passwords } = req.body;

        if (!passwords || !Array.isArray(passwords)) {
            return res.status(400).json({
                success: false,
                message: "Invalid passwords format"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Decrypt and import passwords
        for (let encryptedPassword of passwords) {
            const {companyName, username, email, password, notes } = encryptedPassword;

            const decryptedPasswordData = {
                companyName: await HashManager.decrypt(companyName),
                username: await HashManager.decrypt(username),
                email: await HashManager.decrypt(email),
                password,  // Password is already decrypted
                notes: await HashManager.decrypt(notes),

            };

            const companyExist = await Company.findOne({ name: decryptedPasswordData.companyName });
            if (!companyExist) {
                return res.status(400).json({
                    success: false,
                    message: `Company ${decryptedPasswordData.companyName} Not Found`
                });
            }

            const passwordStorage = await PassKey.create({
                userId,
                companyName: decryptedPasswordData.companyName,
                username: decryptedPasswordData.username,
                email: decryptedPasswordData.email,
                password: decryptedPasswordData.password,
                notes: decryptedPasswordData.notes,
                image:companyExist.image
            });

            user.passwordStorage.storage.push(passwordStorage._id);
            user.passwordStorage.total += 1;
        }

        await user.save();

        return res.status(201).json({
            success: true,
            message: "Passwords Imported Successfully"
        });
    } catch (err) {
        return helper.sendError(err.statusCode || 500, res, { error: err.message }, req);
    }
};