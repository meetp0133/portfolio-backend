const express = require('express');
const router = express.Router();
const projectController = require('../../../controller/v1/project.controller');
const { userAuth } = require("../../../middleware/user.auth");
const { validMulterUploadMiddleware, uploadImage } = require('../../../middleware/uploadImage');

router.get('/', (req, res) => res.send('Welcome to Project route'));

router.post('/add-edit', userAuth, validMulterUploadMiddleware(uploadImage), projectController.addEditProject);
router.post('/view', userAuth, projectController.viewProject);
router.post('/list', userAuth, projectController.listProject);
router.post('/delete', userAuth, projectController.deleteProject);

module.exports = router;