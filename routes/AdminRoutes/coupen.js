const express=require("express");
const router=express.Router();
const {userAuth,isAdmin}=require("../../middlewares/authMiddleware")
const coupenController=require("../../controllers/AdminController/coupenController")

router.post("/create-coupen",userAuth,isAdmin,coupenController.createCoupen);
router.put("/update-coupen",userAuth,isAdmin,coupenController.updateCoupen);
router.delete("/delete-coupen",userAuth,isAdmin,coupenController.deleteCoupen);

router.get("/:id",coupenController.getACoupen);
router.get("/",coupenController.getAllCoupen);

module.exports=router;