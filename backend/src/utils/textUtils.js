
const normalizeText = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
};


const extractEmail = (text) => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
};


const extractPhone = (text) => {
  const match = text.match(/(\+?\d[\d\s\-().]{8,14}\d)/);
  return match ? match[0].trim() : null;
};


const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  for (const line of lines.slice(0, 8)) {
    
    if (/[0-9@]/.test(line)) continue;
    if (line.length > 50) continue;
    if (/resume|curriculum|vitae|profile|summary/i.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      return line;
    }
  }
  return lines[0] || 'Unknown Candidate';
};


const extractYearsOfExperience = (text) => {
  const patterns = [
    /(\d+)\+?\s*years?\s*of\s*(work\s*)?experience/i,
    /experience[:\s]+(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*years?\s*experience/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseFloat(match[1]);
  }
  return null;
};


const STOPWORDS = new Set([
  'with', 'that', 'this', 'have', 'from', 'they', 'will', 'been', 'were',
  'their', 'what', 'when', 'where', 'which', 'while', 'about', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'each', 'other', 'both', 'more', 'also', 'than', 'then', 'them',
  'these', 'those', 'some', 'such', 'only', 'same', 'very', 'just'
]);

const extractKeywords = (text, limit = 40) => {
  const words = normalizeText(text).split(/\s+/);
  const freq = {};
  words.forEach(w => {
    if (w.length >= 4 && !STOPWORDS.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

const SKILL_PATTERNS = [
  'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
  'react', 'angular', 'vue', 'next\\.?js', 'nuxt', 'svelte', 'node\\.?js', 'express', 'django', 'flask',
  'spring', 'laravel', 'rails', 'fastapi',
  'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'cassandra', 'dynamodb',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
  'git', 'github', 'gitlab', 'bitbucket',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui',
  'rest', 'graphql', 'grpc', 'websocket',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'data analysis', 'pandas', 'numpy', 'tableau', 'power bi',
  'agile', 'scrum', 'jira', 'devops', 'microservices',
  'linux', 'bash', 'powershell',
  'figma', 'photoshop', 'illustrator',
  'excel', 'sql', 'nosql', 'api', 'json', 'xml'
];

const extractSkills = (text) => {
  const normalized = normalizeText(text);
  const found = [];
  SKILL_PATTERNS.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(normalized)) {
      found.push(skill.replace(/\\\./g, '.').replace(/\\/g, ''));
    }
  });
  return [...new Set(found)];
};


const extractEducation = (text) => {
  const t = text.toLowerCase();
  if (/ph\.?d|doctorate|doctor of/i.test(t)) return 'PhD';
  if (/master'?s?|m\.?s\.?|m\.?e\.?|mba|m\.?tech/i.test(t)) return 'Masters';
  if (/bachelor'?s?|b\.?s\.?|b\.?e\.?|b\.?tech|b\.?sc|undergraduate/i.test(t)) return 'Bachelors';
  if (/associate'?s?|diploma|certificate/i.test(t)) return 'Associate/Diploma';
  return null;
};

module.exports = {
  normalizeText,
  extractEmail,
  extractPhone,
  extractName,
  extractYearsOfExperience,
  extractKeywords,
  extractSkills,
  extractEducation,
};