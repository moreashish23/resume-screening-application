const { extractSkills, extractEducation, extractYearsOfExperience, extractKeywords } = require('../utils/textUtils');


const parseJobDescription = (text) => {
  const skills = extractSkills(text);
  const education = extractEducation(text);
  const yearsExp = extractYearsOfExperience(text);
  const keywords = extractKeywords(text, 50);

  return {
    skills,
    education,
    yearsExp,
    keywords,
  };
};

module.exports = { parseJobDescription };