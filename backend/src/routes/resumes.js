const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadResumes, analyzeResumes } = require('../controllers/resumeController');


router.post('/upload', upload.array('resumes', 20), uploadResumes);


router.post('/analyze', analyzeResumes);

module.exports = router;