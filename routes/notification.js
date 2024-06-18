const express = require('express');
const { userAuth } = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post("/get-fcm",userAuth,notificationController.saveFCMToken);

module.exports = router;