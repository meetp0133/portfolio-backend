const UserModel = require("../../model/user");
const constants = require("../../../config/constants");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { generateOTP, deleteFilesIfAnyValidationError, deleteLocalFile } = require("../../helpers/helper");
const { addTimeToCurrentTimestamp } = require("../../helpers/dateFormat.helper");
const User = require("../../model/user");

module.exports.register = async (req, res) => {
    try {
        const reqBody = req.body;

        const checkEmailExist = await UserModel.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (checkEmailExist) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("userAlreadyExists") });
        }

        if (reqBody.password !== reqBody.confirmPassword) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('passwordAndConfirmPasswordDidNotMatch') });
        }

        reqBody.profileImage = req?.files?.profileImage ? req?.files?.profileImage?.[0]?.filename : '';
        reqBody.password = await bcrypt.hash(reqBody.password, 10);

        const userDetails = new UserModel(reqBody);

        // Send otp
        userDetails.otp = generateOTP();;
        userDetails.otpExpiresAt = addTimeToCurrentTimestamp(constants.OTP.EXPIRES_IN, 'minutes');

        await userDetails.save();

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("userRegister"), data: userDetails })

    } catch (err) {
        console.log(`Error(register)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });

    }
};

module.exports.verifyUser = async (req, res) => {
    try {
        const reqBody = req.body;

        let user = await UserModel.findOne({
            email: reqBody.email,
            status: { $ne: constants.STATUS.DELETED }
        });

        if (!user) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('userNotFound') });

        if (moment().isAfter(user.otpExpiresAt)) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('otpHasBeenExpired') });

        if (reqBody.otp !== user.otp) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('invalidOtp') });

        user.isVerified = true;
        user.otp = 0;
        user.otpExpiresAt = 0
        await user.save();

        let token = await user.generateAuthToken();

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("userVerified"), token: token, data: user })

    } catch (err) {
        console.log(`Error(verifyUser)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });

    }
};

module.exports.resendOtpOrForgotPassword = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({
            email: reqBody.email,
            status: constants.STATUS.ACTIVE
        });
        if (!existingUser) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('userNotFound') });

        existingUser.otp = generateOTP();
        existingUser.otpExpiresAt = addTimeToCurrentTimestamp(constants.OTP.EXPIRES_IN, 'minutes');

        await existingUser.save();

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("otpSendSuccessfully") })
    } catch (err) {
        console.log(`Error(resendOtp)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
};

module.exports.login = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({ email: reqBody.email, status: constants.STATUS.ACTIVE });
        if (!existingUser) return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__('emailOrPasswordWrong') });

        const validPassword = await bcrypt.compare(reqBody.password, existingUser.password);
        if (!validPassword) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('emailOrPasswordWrong') });

        let token = await existingUser.generateAuthToken();

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("userLoggedIn"), token: token, data: existingUser });

    } catch (err) {
        console.log(`Error(login)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        let reqBody = req.body;

        let existingUser = await UserModel.findOne({
            email: reqBody.email,
            status: constants.STATUS.ACTIVE
        });
        if (!existingUser) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('userNotFound') });

        if (moment().isAfter(existingUser.otpExpiresAt)) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('otpHasBeenExpired') });

        if (reqBody.otp !== existingUser.otp) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__('invalidOtp') });

        existingUser.password = await bcrypt.hash(reqBody.password, 10);
        existingUser.otp = 0;
        existingUser.otpExpiresAt = 0

        await existingUser.save()

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("passwordChangedSuccessfully") })
    } catch (err) {
        console.log(`Error(resetPassword)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
};

module.exports.viewProfile = async (req, res) => {
    try {
        let userId = req.user._id;

        let checkUser = await UserModel.findOne({
            _id: userId,
            status: constants.STATUS.ACTIVE
        });

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("passwordChangedSuccessfully"), data: checkUser })
    } catch (err) {
        console.log(`Error(resetPassword)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
};

module.exports.editProfile = async (req, res) => {
    try {
        const user = req.user._id;
        const reqBody = req.body;

        let userData = await UserModel.findOne({ _id: user._id, status: constants.STATUS.ACTIVE });
        let oldImage = userData ? userData.profileImage : ""

        userData.fullName = reqBody.fullName;
        userData.mobileNumber = reqBody.mobileNumber;
        userData.profileImage = req?.files?.profileImage ? req?.files?.profileImage?.[0]?.filename : userData.profileImage;

        await userData.save();

        if (oldImage && req?.files?.profileImage) deleteLocalFile("user", oldImage)

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("userRegister"), data: userData })

    } catch (err) {
        console.log(`Error(editProfile)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
}
