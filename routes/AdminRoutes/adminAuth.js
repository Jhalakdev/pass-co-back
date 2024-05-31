const express = require('express');
const { userAuth, isAdmin } = require('../../middlewares/authMiddleware');
const authController = require('../../controllers/AdminController/adminAuthController');
const router = express.Router();

//Registration
router.post("/signup",authController.signupAdmin)
router.post("/login",authController.loginAdmin)
router.get("/logout",userAuth,isAdmin,authController.logoutUser);

router.get("/forget-password",authController.forgetPassword)
router.put("/verifyOtp",authController.verfyemailorphonecode);
router.put("/reset-password",authController.resetPassword);

router.put("/change-password",userAuth,isAdmin,authController.changePassword)

module.exports = router;
