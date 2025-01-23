const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/middleware');
const userController = require('../controllers/messageController');

router.get('/allmessages/:friendId',verifyToken,userController.getMessagesBetweenUsers);

module.exports = router;