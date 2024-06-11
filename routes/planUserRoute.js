const express=require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const {upload}=require("../middlewares/multerMiddleware")
const planController=require("../controllers/planController")
const router=express.Router();

router.post("/select-plan/:id",userAuth,planController.selectPlan);
router.get("/payment-verify",userAuth,planController.paymentSuccess);
router.post("/upload",userAuth,upload.any("file"),planController.fileShare)

module.exports=router