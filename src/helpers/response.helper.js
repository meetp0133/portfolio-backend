const { deleteFilesIfAnyValidationError } = require("./helper");

//send validator response
module.export.validatorFunction = async (req, res, next = null) => {
    try {

        if (req?.validationMessage) {
            await deleteFilesIfAnyValidationError(req?.files ? req.files : {});
            return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).json({ message: res.__(req.validationMessage) });
        }

        next();
    } catch (err) {
        console.log('Error(validatorFunction)', err);
    }
};


