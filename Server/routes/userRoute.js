const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/middleware');
const userController = require('../controllers/userController');



router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', verifyToken, userController.logout);

router.get('/search', verifyToken, userController.searchUsers);
router.get('/userId', verifyToken, userController.getCurrentUserId);



module.exports = router;