const express=require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const {upload}=require("../middlewares/multerMiddleware")
const planController=require("../controllers/planController")
const router=express.Router();

router.post("/select-plan",userAuth,planController.selectPlan);
router.post("/payment-success",userAuth,planController.paymentSuccess);
router.post("/upload",userAuth,upload.any("file"),planController.fileShare);

router.get("/my-plan",userAuth,planController.myPlan);

router.post("/apply-coupon",userAuth,planController.applyCoupon);
router.post("/remove-coupon",userAuth,planController.removeCoupon);

module.exports=router