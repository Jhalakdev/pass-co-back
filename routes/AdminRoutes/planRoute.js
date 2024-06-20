const express = require('express');
const { userAuth, isAdmin } = require('../../middlewares/authMiddleware');
const planController=require("../../controllers/AdminController/planController");
const { upload } = require('../../middlewares/multerMiddleware');
const router = express.Router();

router.post("/create-plan",userAuth,isAdmin,upload.fields([{
    name: "planImage",maxCount: 1
}]),planController.createPlan)
router.put("/update-plan/:id",userAuth,isAdmin,upload.fields([{
    name: "planImage",maxCount: 1
}]),planController.updatePlan)
router.delete("/delete-plan/:id",userAuth,isAdmin,planController.deletePlan)

router.get("/getAPlan/:id",userAuth,planController.getAPlan)
router.get("/getAllPlan",userAuth,planController.getAllPlan)

module.exports = router;
