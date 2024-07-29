const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dateFormat = require('../helpers/dateFormat.helper');
const constants = require('../../config/constants');
const { JWT_AUTH_TOKEN_SECRET, JWT_EXPIRES_IN, } = require('../../config/key');

const userSchema = new mongoose.Schema({
    status: {
        type: Number,
        default: constants.STATUS.ACTIVE,
        index: true
    },
    fullName: {
        type: String,
        index: true
    },
    email: {
        type: String,
        index: true,
        lowercase: true
    },
    password: {
        type: String,
    },
    profileImage: {
        type: String,
        default: '',
    },
    mobileNumber: {
        type: String,
    }, 
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    otp: {
        type: Number,
        index: true
    },
    otpExpiresAt: {
        type: Number,
    },
    createdAt: {
        type: Number,
        index: true
    },
    updatedAt: {
        type: Number,
        index: true
    },
    deletedAt: {
        type: Number,
        default: null,
        index: true
    }
},{collection:"user"});


//Checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

//Output data to JSON
userSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    return userObject;
};


//Generate auth token
userSchema.methods.generateAuthToken = async function () {
    let user = this;

    let token = jwt.sign({
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        status: user.status,
    }, JWT_AUTH_TOKEN_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });

    return token;
}

userSchema.pre('save', async function (next) {
    if (!this?.createdAt) {
        this.createdAt = dateFormat.setCurrentTimestamp();
    }
    this.updatedAt = dateFormat.setCurrentTimestamp();
    next();
});

const User = mongoose.model('user', userSchema);
module.exports = User;