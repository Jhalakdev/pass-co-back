const express=require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const cardController=require("../controllers/cardController");
const router=express.Router();

router.post("/add-card",userAuth,cardController.addCard);
router.get("/",userAuth,cardController.getCards);
router.get("/:id",userAuth,cardController.getACard);

router.delete("/:id",userAuth,cardController.deleteCard);

module.exports=router