const express = require('express');
const router = express.Router();
const { getRankedCandidates, exportCSV, getAllCandidates } = require('../controllers/candidateController');

router.get('/', getAllCandidates);
router.get('/results/:jobDescId', getRankedCandidates);
router.get('/export/:jobDescId', exportCSV);

module.exports = router;