const express = require('express');
const router = express.Router();
const { getReportStatus } = require('../controllers/reportController');

// Get report status
router.get('/reports/:activityId', getReportStatus);


module.exports = router;
