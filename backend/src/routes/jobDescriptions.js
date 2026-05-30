const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createJobDescription,
  getAllJobDescriptions,
  getJobDescription,
  deleteJobDescription,
} = require('../controllers/jobDescriptionController');

router.post('/', upload.single('jdFile'), createJobDescription);
router.get('/', getAllJobDescriptions);
router.get('/:id', getJobDescription);
router.delete('/:id', deleteJobDescription);

module.exports = router;