const express = require('express');
const userRoute = require('./userRoute');
const friendRoute = require('./friendRoute');
const messageRoute = require('./messageRoute');
const authRoute = require('./authRoute');

const router = express.Router();

// Define routes
router.use('/friend', friendRoute);
router.use('/users', userRoute);
router.use('/messages', messageRoute);
router.use('/auth', authRoute);

module.exports = router;