const mongoose = require('mongoose');
const dateFormat = require('../helpers/dateFormat.helper');
const constants = require("../../config/constants");

const projectSchema = new mongoose.Schema({
    status: {
        type: Number,
        default: constants.STATUS.ACTIVE,
        index: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },    
    projectName: {
        type: String
    },
    link: {
        type: String
    },
    slug: {
        type: String
    },
    sortDescription: {
        type: String
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Number,
        index: true
    },
    updatedAt: {
        type: Number,
        index: true
    }
}, { collection: "project" });


projectSchema.pre('save', async function (next) {
    if (!this?.createdAt) {
        this.createdAt = dateFormat.setCurrentTimestamp();
    }
    this.updatedAt = dateFormat.setCurrentTimestamp();
    next();
});

const project = mongoose.model('project', projectSchema);
module.exports = project;