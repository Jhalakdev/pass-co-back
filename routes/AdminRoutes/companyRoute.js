const express = require('express');
const {upload}=require("../../middlewares/multerMiddleware")
const { userAuth, isAdmin } = require('../../middlewares/authMiddleware');
const companyController = require('../../controllers/AdminController/companyController');
const router = express.Router();

//Registration
router.post("/create-company",userAuth,isAdmin,upload.fields([{
    name: "companyImage",maxCount: 1
}]),companyController.createCompany)

//Search
router.get("/search", companyController.searchCompany);
router.get("/sort", companyController.sortCompany);

//Update Company
router.put("/update-company/:id",userAuth,isAdmin,upload.fields([
    {name:"companyImage",maxCount:1}
]),companyController.updateCompany)

router.delete("/deleteCompany/:id",userAuth,isAdmin,companyController.deleteCompany)

//get A Company
router.get("/:id",companyController.getACompany)
router.get("/",companyController.getAllCompany)



module.exports = router;
