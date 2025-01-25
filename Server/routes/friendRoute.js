const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/middleware');
const userController = require('../controllers/friendController');

router.get('/friends', verifyToken, userController.getFriendsList);
router.post('/friend-request', verifyToken, userController.sendFriendRequest);
router.post('/friend-request/accept', verifyToken, userController.acceptFriendRequest);
router.get('/friend-request/pending', verifyToken, userController.getPendingRequests);
router.get('/friend-request/friendship-status/:targetUserId', verifyToken, userController.checkFriendshipStatus);

module.exports = router;