const prisma = require('../config/database');
const { parseJobDescription } = require('../services/jdService');
const { extractTextFromFile } = require('../services/parserService');
const { success, error } = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');

const createJobDescription = async (req, res, next) => {
  try {
    let { title, content } = req.body;

   
    if (req.file) {
      content = await extractTextFromFile(req.file.path);
     
      fs.unlinkSync(req.file.path);
    }

    if (!content || content.trim().length < 20) {
      return error(res, 'Job Description content is too short', 400);
    }

    const parsed = parseJobDescription(content);

    const jd = await prisma.jobDescription.create({
      data: {
        title: title || 'Untitled Job Description',
        content,
        skills: parsed.skills,
        education: parsed.education || null,
        keywords: parsed.keywords,
        experience: parsed.yearsExp ? `${parsed.yearsExp} years` : null,
      },
    });

    return success(res, jd, 'Job Description created', 201);
  } catch (err) {
    next(err);
  }
};


const getAllJobDescriptions = async (req, res, next) => {
  try {
    const jds = await prisma.jobDescription.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { analyses: true } } },
    });
    return success(res, jds);
  } catch (err) {
    next(err);
  }
};


const getJobDescription = async (req, res, next) => {
  try {
    const jd = await prisma.jobDescription.findUnique({
      where: { id: req.params.id },
    });
    if (!jd) return error(res, 'Job Description not found', 404);
    return success(res, jd);
  } catch (err) {
    next(err);
  }
};

 
const deleteJobDescription = async (req, res, next) => {
  try {
    await prisma.jobDescription.delete({ where: { id: req.params.id } });
    return success(res, null, 'Job Description deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { createJobDescription, getAllJobDescriptions, getJobDescription, deleteJobDescription };