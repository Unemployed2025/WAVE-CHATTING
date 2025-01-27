const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/middleware');
const messageController = require('../controllers/messageController');

router.get('/allmessages/:friendId',verifyToken,messageController.getMessagesBetweenUsers);

router.post('/group', verifyToken, messageController.createGroup);
router.get('/group/:groupId', verifyToken, messageController.getGroupMessages);
router.post('/group/:groupId/message', verifyToken, messageController.sendGroupMessage);
router.get('/groups', verifyToken, messageController.getUserGroups);
router.get('/group/:groupId/members', verifyToken, messageController.getGroupMembers);

module.exports = router;