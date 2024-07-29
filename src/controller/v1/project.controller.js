const ProjectModel = require("../../model/project");
const constants = require("../../../config/constants");
const { deleteLocalFile } = require("../../helpers/helper");

module.exports.addEditProject = async (req, res) => {
    try {
        const reqBody = req.body;
        const userId = req.user._id;

        let existingProject, message = "projectAdded", oldImage

        if (reqBody.projectId) {
            existingProject = await ProjectModel.findOne({ _id: reqBody.projectId, status: constants.STATUS.ACTIVE });
            if (!existingProject) return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("projectNotFound") });

            message = "projectUpdated"

            oldImage = existingProject.image || ""
        } else {
            existingProject = new ProjectModel(reqBody)
        }
        existingProject.userId = userId;
        existingProject.projectName = reqBody?.projectName ? reqBody.projectName : existingProject.projectName
        existingProject.link = reqBody?.link ? reqBody.link : existingProject.link
        existingProject.sortDescription = reqBody?.sortDescription ? reqBody.sortDescription : existingProject.sortDescription
        existingProject.description = reqBody?.description ? reqBody.description : existingProject.description
        existingProject.slug = reqBody?.slug ? reqBody.slug : existingProject.slug
        existingProject.image = req?.files?.image ? req?.files?.image?.[0]?.filename : existingProject.image;

        await existingProject.save()

        if (oldImage && req?.files?.image) deleteLocalFile("project", oldImage)

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__(message), data: existingProject })
    } catch (err) {
        console.log(`Error(addEditProject)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
};

module.exports.listProject = async (req, res) => {
    try {
        const userId = req.user._id;

        const projectList = await ProjectModel.find({ userId, status: constants.STATUS.ACTIVE })
        const totalCount = await ProjectModel.find({ userId, status: constants.STATUS.ACTIVE }).countDocuments()

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("projectListed"), totalCount, data: projectList })
    } catch (err) {
        console.log(`Error(listProject)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
};

module.exports.viewProject = async (req, res) => {
    try {
        const reqBody = req.body;

        let existingProject = await ProjectModel.findOne({ _id: reqBody.projectId, status: constants.STATUS.ACTIVE });
        if (!existingProject) return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("projectNotFound") });

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("projectFound"), data: existingProject })
    } catch (err) {
        console.log(`Error(viewProject)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
}

module.exports.deleteProject = async (req, res) => {
    try {
        const reqBody = req.body;

        let existingProject = await ProjectModel.findOneAndUpdate({ _id: reqBody.projectId, status: constants.STATUS.ACTIVE }, { $set: { status: constants.STATUS.DELETED } });
        if (!existingProject) return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("projectNotFound") });

        return res.status(constants.WEB_STATUS_CODE.OK).json({ message: res.__("projectFound"), data: existingProject })
    } catch (err) {
        console.log(`Error(deleteProject)`, err);
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).json({ message: res.__('somethingWentWrongPleaseTryAgain') });
    }
}