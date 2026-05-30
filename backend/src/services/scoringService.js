const { normalizeText } = require('../utils/textUtils');


const EDUCATION_LEVELS = {
  'phd': 4, 'masters': 3, 'bachelors': 2, 'associate/diploma': 1
};

const jaccardSimilarity = (arr1, arr2) => {
  if (!arr1.length && !arr2.length) return 1;
  if (!arr1.length || !arr2.length) return 0;
  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));
  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;
  return intersection / union;
};


const scoreSkills = (resumeSkills, jdSkills) => {
  if (!jdSkills.length) return 50; 

  const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const jdSet = new Set(jdSkills.map(s => s.toLowerCase()));

  const matchingSkills = [...jdSet].filter(s => resumeSet.has(s));
  const missingSkills = [...jdSet].filter(s => !resumeSet.has(s));

  const score = (matchingSkills.length / jdSet.size) * 100;

  return {
    score: Math.min(100, score),
    matchingSkills,
    missingSkills,
  };
};


const scoreExperience = (resumeYears, jdText) => {
  
  const jdMatch = jdText?.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  const requiredYears = jdMatch ? parseFloat(jdMatch[1]) : null;

  if (!requiredYears) return 50; 
  if (!resumeYears) return 25;   

  if (resumeYears >= requiredYears) return 100;
  
  return Math.min(100, (resumeYears / requiredYears) * 100);
};


const scoreEducation = (resumeEdu, jdEdu) => {
  if (!jdEdu) return 50; 
  if (!resumeEdu) return 0;

  const jdLevel = EDUCATION_LEVELS[jdEdu.toLowerCase()] || 0;
  const resumeLevel = EDUCATION_LEVELS[resumeEdu.toLowerCase()] || 0;

  if (resumeLevel >= jdLevel) return 100;
  if (resumeLevel === jdLevel - 1) return 60;
  return 20;
};


const scoreKeywords = (resumeKeywords, jdKeywords) => {
  const similarity = jaccardSimilarity(resumeKeywords, jdKeywords);
  return similarity * 100;
};


const calculateScore = (resume, jobDescription) => {
  
  const skillResult = scoreSkills(resume.skills || [], jobDescription.skills || []);
  const skillScore = typeof skillResult === 'object' ? skillResult.score : skillResult;
  const matchingSkills = typeof skillResult === 'object' ? skillResult.matchingSkills : [];
  const missingSkills = typeof skillResult === 'object' ? skillResult.missingSkills : [];


  const expScore = scoreExperience(resume.yearsExp, jobDescription.content);

  
  const eduScore = scoreEducation(resume.education, jobDescription.education);


  const kwScore = scoreKeywords(resume.keywords || [], jobDescription.keywords || []);

 
  const totalScore =
    skillScore * 0.50 +
    expScore   * 0.25 +
    eduScore   * 0.15 +
    kwScore    * 0.10;

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    skillScore: Math.round(skillScore * 10) / 10,
    experienceScore: Math.round(expScore * 10) / 10,
    educationScore: Math.round(eduScore * 10) / 10,
    keywordScore: Math.round(kwScore * 10) / 10,
    matchingSkills,
    missingSkills,
  };
};

module.exports = { calculateScore };