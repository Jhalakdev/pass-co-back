const express=require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const {upload}=require("../middlewares/multerMiddleware")
const planController=require("../controllers/planController");
const familyFriendController=require("../controllers/friendsFamilyController");
const router=express.Router();

router.post("/select-plan",userAuth,planController.selectPlan);

router.post("/upload",userAuth,upload.any("file"),planController.fileShare);
router.post("/apply-coupon",userAuth,planController.applyCoupon);
router.post("/remove-coupon",userAuth,planController.removeCoupon);

router.post("/payment-verify",userAuth,planController.paymentSuccess);

router.get("/my-plan",userAuth,planController.myPlan);

router.post("/search",userAuth,familyFriendController.searchUser);

router.post("/add-user/:id",userAuth,familyFriendController.addUser);

router.post("/verify-user",userAuth,familyFriendController.verifyOtpAndAddUser);

router.post("/remove-user/:id",userAuth,familyFriendController.removeUser);

router.get("/family-members",userAuth,familyFriendController.getFamilyMember);

module.exports=router