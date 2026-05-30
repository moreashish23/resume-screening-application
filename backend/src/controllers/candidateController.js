const prisma = require('../config/database');
const { success, error } = require('../utils/apiResponse');


const getRankedCandidates = async (req, res, next) => {
  try {
    const { jobDescId } = req.params;

    if (!jobDescId) {
      return error(res, 'jobDescId parameter is required', 400);
    }

    const { search, sort = 'rank', order = 'asc' } = req.query;

    
    const analyses = await prisma.analysisResult.findMany({
      where: {
        jobDescId,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            skills: true,
            education: true,
            yearsExp: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { totalScore: 'desc' },
    });

   
    let result = analyses;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = analyses.filter(a =>
        a.candidate?.name?.toLowerCase().includes(q)
      );
    }

    // Apply sort
    if (sort === 'rank') {
      result.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    } else {
      result.sort((a, b) =>
        order === 'asc' ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
      );
    }

    return success(res, result);
  } catch (err) {
    console.error('getRankedCandidates error:', err);
    next(err);
  }
};


const exportCSV = async (req, res, next) => {
  try {
    const { jobDescId } = req.params;

    if (!jobDescId) {
      return error(res, 'jobDescId is required', 400);
    }

    const analyses = await prisma.analysisResult.findMany({
      where: { jobDescId },
      include: {
        candidate: {
          select: { name: true, email: true },
        },
        resume: {
          select: { education: true, yearsExp: true },
        },
      },
      orderBy: { rank: 'asc' },
    });

    if (analyses.length === 0) {
      return error(res, 'No data to export for this Job Description', 404);
    }

    const escapeCSV = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Rank', 'Name', 'Email', 'TotalScore', 'SkillScore',
      'ExperienceScore', 'EducationScore', 'KeywordScore',
      'MatchingSkills', 'MissingSkills', 'Education', 'YearsExperience',
    ];

    const rows = analyses.map(a => [
      a.rank ?? '',
      a.candidate?.name ?? '',
      a.candidate?.email ?? '',
      a.totalScore ?? 0,
      a.skillScore ?? 0,
      a.experienceScore ?? 0,
      a.educationScore ?? 0,
      a.keywordScore ?? 0,
      (a.matchingSkills || []).join('; '),
      (a.missingSkills || []).join('; '),
      a.resume?.education ?? '',
      a.resume?.yearsExp ?? '',
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="candidates.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('exportCSV error:', err);
    next(err);
  }
};


const getAllCandidates = async (req, res, next) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        resumes: {
          select: { id: true, fileName: true, skills: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, candidates);
  } catch (err) {
    console.error('getAllCandidates error:', err);
    next(err);
  }
};

module.exports = { getRankedCandidates, exportCSV, getAllCandidates };