const express = require('express');
const { userAuth } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const {upload}=require("../middlewares/multerMiddleware");
const router = express.Router();

//Registration
router.post("/signup",authController.signupUser)
router.post("/login",authController.loginUser)
router.get("/logout",userAuth,authController.logoutUser);

router.post("/forget-password",authController.forgetPassword);
router.post("/resend-otp",authController.resendOtp);
router.put("/verifyOtp",authController.verfyemailorphonecode);
router.put("/reset-password",authController.resetPassword);

router.put("/change-password",userAuth,authController.changePassword);

router.post("/profileImage",userAuth,upload.fields([
    {name:"image",maxCount:1}
]),authController.updateProfileImage);

router.get("/",userAuth,authController.getUser);

module.exports = router;
