const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const {
  extractName, extractEmail, extractPhone,
  extractSkills, extractEducation, extractYearsOfExperience, extractKeywords
} = require('../utils/textUtils');


const getPdfParse = () => {
  const mod = require('pdf-parse');
 
  if (typeof mod === 'function') return mod;
  if (typeof mod.default === 'function') return mod.default;
  throw new Error('pdf-parse could not be loaded correctly');
};


const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const pdfParse = getPdfParse();
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.doc' || ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}`);
};


const parseResume = async (filePath) => {
  let rawText = '';
  try {
    rawText = await extractTextFromFile(filePath);
  } catch (err) {
    throw new Error(`Failed to parse resume file: ${err.message}`);
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Resume file appears to be empty or unreadable');
  }

  const name = extractName(rawText);
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const skills = extractSkills(rawText);
  const education = extractEducation(rawText);
  const yearsExp = extractYearsOfExperience(rawText);
  const keywords = extractKeywords(rawText);

  const expMatch = rawText.match(/experience[\s\S]{0,2000}/i);
  const experience = expMatch ? expMatch[0].substring(0, 500) : null;

  return {
    name,
    email,
    phone,
    skills,
    education,
    yearsExp,
    keywords,
    experience,
    rawText,
  };
};

module.exports = { parseResume, extractTextFromFile };