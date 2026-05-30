const prisma = require('../config/database');
const { parseResume } = require('../services/parserService');
const { calculateScore } = require('../services/scoringService');
const { success, error } = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');


const rankCandidatesForJD = async (jobDescriptionId) => {
  try {
    const analyses = await prisma.analysisResult.findMany({
      where: { jobDescId: jobDescriptionId },
      orderBy: { totalScore: 'desc' },
    });
    for (let i = 0; i < analyses.length; i++) {
      await prisma.analysisResult.update({
        where: { id: analyses[i].id },
        data: { rank: i + 1 },
      });
    }
  } catch (err) {
    console.error('Ranking error:', err.message);
  }
};


const uploadResumes = async (req, res, next) => {
  const files = req.files || [];

  if (files.length === 0) {
    return error(res, 'No files uploaded. Please attach at least one resume.', 400);
  }

  const { jobDescriptionId } = req.body;
  const results = [];
  const errors = [];

  for (const file of files) {
    const filePath = file.path;
    try {
     
      const parsed = await parseResume(filePath);

      
      let candidate = await prisma.candidate.findFirst({
        where: {
          name: parsed.name,
          ...(parsed.email ? { email: parsed.email } : {}),
        },
      });

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            name: parsed.name || 'Unknown',
            email: parsed.email || null,
            phone: parsed.phone || null,
          },
        });
      }

      
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          fileName: file.originalname,
          filePath: `/uploads/${path.basename(filePath)}`,
          fileType: path.extname(file.originalname).toLowerCase(),
          rawText: parsed.rawText || '',
          skills: parsed.skills || [],
          experience: parsed.experience || null,
          education: parsed.education || null,
          keywords: parsed.keywords || [],
          yearsExp: parsed.yearsExp || null,
        },
      });

      
      let analysis = null;
      if (jobDescriptionId) {
        const jd = await prisma.jobDescription.findUnique({
          where: { id: jobDescriptionId },
        });

        if (jd) {
          const scores = calculateScore(
            {
              skills: resume.skills,
              yearsExp: resume.yearsExp,
              education: resume.education,
              keywords: resume.keywords,
            },
            {
              skills: jd.skills,
              content: jd.content,
              education: jd.education,
              keywords: jd.keywords,
            }
          );

          analysis = await prisma.analysisResult.upsert({
            where: { resumeId_jobDescId: { resumeId: resume.id, jobDescId: jd.id } },
            update: { ...scores },
            create: {
              resumeId: resume.id,
              jobDescId: jd.id,
              candidateId: candidate.id,
              ...scores,
            },
          });
        }
      }

      results.push({ candidate, resume, analysis });
    } catch (parseErr) {
      console.error(`Error processing file ${file.originalname}:`, parseErr.message);
      errors.push({ file: file.originalname, error: parseErr.message });
    }
  }

 
  if (jobDescriptionId && results.length > 0) {
    await rankCandidatesForJD(jobDescriptionId);
  }

  if (results.length === 0) {
    return error(
      res,
      `All ${files.length} file(s) failed to process. Errors: ${errors.map(e => e.error).join('; ')}`,
      422
    );
  }

  return success(
    res,
    { processed: results, failed: errors },
    `${results.length} resume(s) processed successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    201
  );
};


const analyzeResumes = async (req, res, next) => {
  try {
    const { jobDescriptionId, resumeIds } = req.body;

    if (!jobDescriptionId) {
      return error(res, 'jobDescriptionId is required', 400);
    }

    const jd = await prisma.jobDescription.findUnique({
      where: { id: jobDescriptionId },
    });

    if (!jd) {
      return error(res, 'Job Description not found', 404);
    }

    const whereClause = resumeIds?.length ? { id: { in: resumeIds } } : {};
    const resumes = await prisma.resume.findMany({ where: whereClause });

    if (resumes.length === 0) {
      return error(res, 'No resumes found to analyze', 404);
    }

    const analysisResults = [];

    for (const resume of resumes) {
      const scores = calculateScore(
        {
          skills: resume.skills,
          yearsExp: resume.yearsExp,
          education: resume.education,
          keywords: resume.keywords,
        },
        {
          skills: jd.skills,
          content: jd.content,
          education: jd.education,
          keywords: jd.keywords,
        }
      );

      const analysis = await prisma.analysisResult.upsert({
        where: { resumeId_jobDescId: { resumeId: resume.id, jobDescId: jd.id } },
        update: { ...scores },
        create: {
          resumeId: resume.id,
          jobDescId: jd.id,
          candidateId: resume.candidateId,
          ...scores,
        },
      });

      analysisResults.push(analysis);
    }

    await rankCandidatesForJD(jobDescriptionId);

    return success(res, analysisResults, 'Analysis complete');
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResumes, analyzeResumes };