const express = require('express');
const { userAuth ,isAdmin} = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get("/get-notification",userAuth,notificationController.getMyNotification);
router.get("/",isAdmin,userAuth,notificationController.getMyNotification);

module.exports = router;