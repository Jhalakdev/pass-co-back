const express=require("express");
const { userAuth, isAdmin } = require("../../middlewares/authMiddleware");
const homeController=require("../../controllers/AdminController/homeController")
const router=express.Router();

router.put("/block-user",userAuth,isAdmin,homeController.blockUser);
router.put("/unblock-user",userAuth,isAdmin,homeController.unblockUser);

router.get("/getAUser/:id",userAuth,isAdmin,homeController.getAUser);
router.get("/getAllUser",userAuth,isAdmin,homeController.getAllUser);

router.get("/getAllorder",userAuth,isAdmin,homeController.getAllOrder);

module.exports=router