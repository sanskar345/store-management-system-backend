const express = require('express');

const otpController = require('../controllers/otpController');

const router = express.Router();

router.post('/generate', otpController.generateOtp);
router.post('/verify', otpController.verifyOtp);


module.exports = router;