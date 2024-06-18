const express = require('express');
const { userAuth } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const {upload}=require("../middlewares/multerMiddleware");

const router = express.Router();

//Registration
router.post("/signup",authController.signupUser);
router.post("/login",authController.loginUser);
router.get("/logout",userAuth,authController.logoutUser);

router.post("/forget-password",authController.forgetPassword);
router.put("/verifyOtp",authController.verfyemailorphonecode);
router.put("/reset-password",authController.resetPassword);

router.put("/change-password",userAuth,authController.changePassword);

router.post("/profileImage",userAuth,upload.fields([
    {name:"image",maxCount:1}
]),authController.updateProfileImage);

router.get("/",userAuth,authController.getUser);

router.post("/google/signup",authController.googleSignup);
router.post("/google/login",authController.googleLogin);

router.post("/fcmToken",userAuth,authController.getFcmToken);


module.exports = router;
