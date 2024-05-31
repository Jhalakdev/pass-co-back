const express = require('express');
const { userAuth } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const router = express.Router();

//Registration
router.post("/signup",authController.signupUser)
router.post("/login",authController.loginUser)
router.get("/logout",userAuth,authController.logoutUser);

router.get("/forget-password",authController.forgetPassword)
router.put("/verifyOtp",authController.verfyemailorphonecode);
router.put("/reset-password",authController.resetPassword);

router.put("/change-password",userAuth,authController.changePassword)

module.exports = router;
