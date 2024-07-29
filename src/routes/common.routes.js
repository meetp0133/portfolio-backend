const express = require('express');
const router = express.Router();

// User LRF route
const userRoutes = require('./api/v1/user.route');
router.use('/api/v1/user/', userRoutes);

// Project route
const projectRoutes = require('./api/v1/project.route');
router.use('/api/v1/project', projectRoutes);

module.exports = router;    