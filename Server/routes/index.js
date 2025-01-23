const express = require('express');
const userRoute = require('./userRoute');
const friendRoute = require('./friendRoute');
const messageRoute = require('./messageRoute');

const router = express.Router();

// Define routes
router.use('/friend', friendRoute);
router.use('/users', userRoute);
router.use('/messages', messageRoute);

module.exports = router;