const express=require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const cradController=require("../controllers/cardController")
const router=express.Router();

router.post("/add-card",userAuth,cradController.addCard);
router.get("/",userAuth,cradController.getCards);
router.get("/:id",userAuth,cradController.getACards);

module.exports=router