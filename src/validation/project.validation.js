const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const helper = require('../helpers/helper');
const constants = require('../../config/constants');

exports.schemaForRegisterUser = Joi.object({
    fullName: Joi.string().trim().min(1).required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).max(15).trim().required(),
    confirmPassword: Joi.string().min(6).max(15).trim().required(),
    mobileNumber: Joi.string().trim().required(),
}).unknown(true);

exports.schemaForProfileImages = Joi.object({
    profileImage: Joi.array().items(
        Joi.object({
            fieldname: Joi.string().valid("profileImage").required(),
        }).unknown(true)),
});


exports.registerValidator = (req, res, next) => {
    let validationFile;
    console.log(req.files)
    let body = req?.headers?.devicetype == 'web' ? req.body : req.query;
    const validationBody = this.schemaForRegisterUser.validate(body);    //validate req.body...
    if (req.files && Object.keys(req.files).length !== 0) {
        validationFile = this.schemaForProfileImages.validate(req.files);  // validate req.files...
    }

    if (validationBody?.error !== undefined || validationFile?.error !== undefined) {
        let validationErr = validationBody.error || validationFile?.error
        let validationMessage = helper.validationMessageKey('validation', validationErr);
        req.validationMessage = validationMessage;
    }
    next();

};


exports.loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email().trim(),
        password: Joi.string().required().trim()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

exports.verifyUser = (req, res, next) => {
    let schema = Joi.object({
        email: Joi.string().required().email().trim(),
        otp: Joi.string().required()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

exports.forgotPasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email().trim(),
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

exports.resetPasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().email().trim(),
        otp: Joi.required(),
        password: Joi.string().required().trim()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
}

exports.schemaForEditUser = {
    fullName: Joi.string().trim().min(1),
    email: Joi.string().email().trim(),
    password: Joi.string().min(6).max(15).trim(),
    confirmPassword: Joi.string().min(6).max(15).trim(),
    // userType: Joi.string().valid('1','2'),
    mobileNumber: Joi.string().optional().allow(null, "")
};

exports.editUserValidation = (req, res, next) => {

    const schema = Joi.object(this.schemaForEditUser).unknown(true);

    const { error } = schema.validate(Object.keys(req?.body)?.length ? req?.body : req?.query);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};

exports.changePasswordValidation = (req, res, next) => {
    const schema = Joi.object({
        oldPassword: Joi.string().trim().required(),
        password: Joi.string().trim().required(),
        confirmPassword: Joi.string().trim().required()
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
        let validationMessage = helper.validationMessageKey('validation', error);
        req.validationMessage = validationMessage;
    }
    next();
};
