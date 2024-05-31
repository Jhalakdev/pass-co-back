const express = require('express');
const { userAuth } = require('../middlewares/authMiddleware');
const fileManagerController=require("../controllers/fileManagerController")
const router = express.Router();

//Get File Manger
router.get("/",userAuth,fileManagerController.getMyFileManager)

module.exports = router;
