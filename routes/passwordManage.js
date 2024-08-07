const express=require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const PasswordManager=require("../controllers/passwordController")
const router=express.Router();

router.get('/export', userAuth, PasswordManager.exportPasswords);
router.post('/import', userAuth, PasswordManager.importPasswords);

router.get("/search-password",userAuth,PasswordManager.searchPasswords);

router.post("/create-password",userAuth,PasswordManager.createPassword);
router.put("/update-password/:id",userAuth,PasswordManager.updatePassword);
router.delete("/delete-password/:id",userAuth,PasswordManager.deletePassword);

router.get("/:id",userAuth,PasswordManager.getSinglePassword);
router.get("/",userAuth,PasswordManager.getAllPasswords);

module.exports=router;