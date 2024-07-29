const express = require('express');
const router = express.Router();
const userController = require('../../../controller/v1/user.controller');
const { userAuth } = require("../../../middleware/user.auth");
const { validMulterUploadMiddleware, uploadImage } = require('../../../middleware/uploadImage');

router.get('/', (req, res) => res.send('Welcome to User route'));

router.post('/register', validMulterUploadMiddleware(uploadImage), userController.register)
router.post('/edit-profile', userAuth, validMulterUploadMiddleware(uploadImage), userController.editProfile)
router.post('/verify-user', userController.verifyUser);
router.post('/resend-otp', userController.resendOtpOrForgotPassword);
router.post('/login', userController.login);
router.post('/reset-password', userController.resetPassword);
router.post('/view-profile', userAuth, userController.viewProfile);

module.exports = router;
