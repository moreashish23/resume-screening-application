# RecruitIQ — AI-Powered Resume Screening & Candidate Ranking

> Automate your hiring pipeline. Upload resumes, define your job description, and get AI-ranked candidates with match scores in seconds.

---

## Live Demo

**Frontend:** https://resume-screening-application-six.vercel.app 
**Backend API:** https://resume-screening-application-b0hn.onrender.com
---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Scoring Algorithm](#scoring-algorithm)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Assumptions](#assumptions)

---

## Features

- Bulk resume upload — 1 to 20 resumes at once (PDF, DOC, DOCX)
- Job Description input — type manually or upload a document
- Automatic parsing — extracts name, email, skills, education, experience
- AI scoring — weighted engine produces a 0 to 100 match score
- Candidate ranking — ranked #1 to N from highest to lowest fit
- Results dashboard — match score, rank, matching skills, missing skills
- Live search across candidate names
- Sort by rank or by raw score
- CSV export — download all results as a spreadsheet
- Fully responsive — works on mobile (320px) through desktop (1440px+)

---

## Tech Stack

### Frontend

- React 18 + Vite
- Tailwind CSS
- React Router DOM v6
- Context API + useReducer for state management
- Axios for HTTP requests
- React Icons

### Backend

- Node.js v20
- Express.js
- Prisma ORM v6
- PostgreSQL via Neon (serverless)
- Multer for file uploads
- pdf-parse for PDF text extraction
- mammoth for DOC/DOCX text extraction

---

## Architecture Overview
CLIENT BROWSER
|
|-- HomePage
|-- UploadPage
|-- ResultsPage
|
Axios HTTP Client (api/index.js)
|
REST API calls
|
EXPRESS.JS SERVER (Port 5000)
|
Routes Layer
|-- /api/resumes
|-- /api/job-descriptions
|-- /api/candidates
|
Controllers Layer
|-- resumeController
|-- jobDescriptionController
|-- candidateController
|
Services Layer
|-- parserService   (pdf-parse + mammoth)
|-- jdService       (JD text analysis)
|-- scoringService  (weighted scoring engine)
|
Prisma ORM Layer
|
NEON POSTGRESQL
|-- candidates
|-- resumes
|-- job_descriptions
|-- analysis_results

### Request Flow

User types or uploads Job Description
POST /api/job-descriptions
-> Parse JD text
-> Extract skills, education, keywords
-> Save to job_descriptions table
User uploads resumes
POST /api/resumes/upload
-> Multer saves file to /uploads
-> parserService extracts raw text
-> textUtils extracts: name, email, skills, education, yearsExp, keywords
-> Save candidate + resume to database
-> scoringService.calculateScore(resume, jd)
-> Save analysis_result with all sub-scores
-> Re-rank all candidates for this JD by totalScore
User views Results page
GET /api/candidates/results/:jobDescId
-> Fetch all analysis_results with candidate + resume data
-> Return ranked list to frontend
-> Frontend renders candidate cards with score rings and skill badges


---

## Scoring Algorithm

The scoring engine uses a weighted multi-factor model to produce a 0 to 100 match score.

### Weights

| Factor             | Weight | Description                                      |
|--------------------|--------|--------------------------------------------------|
| Skills Match       | 50%    | How many JD-required skills the candidate has    |
| Experience Match   | 25%    | Candidate years vs JD-required years             |
| Education Match    | 15%    | Degree level alignment                           |
| Keyword Similarity | 10%    | Jaccard similarity of extracted keywords         |

### Formula
Total Score =
(skillScore  x 0.50) +
(expScore    x 0.25) +
(eduScore    x 0.15) +
(kwScore     x 0.10)

### Skills Match (50%)
skillScore = (matchingSkills.length / jdRequiredSkills.length) x 100

- Both sets are normalized to lowercase before comparison
- A curated list of 50+ technology skills is used for extraction
- matchingSkills = skills present in both resume and JD
- missingSkills = skills in JD but not found in resume
- If JD specifies no detectable skills, neutral score of 50 is used

### Experience Match (25%)
if resumeYears >= requiredYears  -->  score = 100
else                             -->  score = (resumeYears / requiredYears) x 100

- Required years are extracted from JD via regex (example: "3+ years experience")
- Resume years extracted via regex from the experience section
- If JD has no year requirement, neutral score of 50 is used
- If candidate years are unknown, low score of 25 is used

### Education Match (15%)

Degree levels are mapped to numeric values:

| Degree                      | Level |
|-----------------------------|-------|
| PhD / Doctorate             | 4     |
| Masters / MBA / MTech       | 3     |
| Bachelors / BTech / BSc     | 2     |
| Associate / Diploma         | 1     |
if resumeLevel >= jdLevel        -->  score = 100
if resumeLevel == jdLevel - 1    -->  score = 60
else                             -->  score = 20

If JD specifies no education requirement, neutral score of 50 is used.

### Keyword Similarity (10%)

Uses Jaccard Similarity between the top 40 keywords from the resume and top 50 from the JD:
Jaccard(A, B)  = |A intersection B| / |A union B|
keywordScore   = Jaccard(resumeKeywords, jdKeywords) x 100

- Stopwords are filtered out
- Only words with 4 or more characters are counted
- Words are sorted by frequency before selecting top keywords

### Score Interpretation

| Score Range | Meaning                          |
|-------------|----------------------------------|
| 75 to 100   | Strong Match — recommend interview |
| 50 to 74    | Moderate Match — meets core requirements |
| 0 to 49     | Weak Match — significant gaps present |

---

## Database Schema

### Tables

**candidates**
- id (uuid, primary key)
- name
- email
- phone
- createdAt, updatedAt

**job_descriptions**
- id (uuid, primary key)
- title
- content (full text)
- skills (array)
- experience
- education
- keywords (array)
- createdAt, updatedAt

**resumes**
- id (uuid, primary key)
- candidateId (foreign key -> candidates)
- fileName
- filePath
- fileType
- rawText (full extracted text)
- skills (array)
- experience
- education
- keywords (array)
- yearsExp
- createdAt, updatedAt

**analysis_results**
- id (uuid, primary key)
- resumeId (foreign key -> resumes)
- jobDescId (foreign key -> job_descriptions)
- candidateId (foreign key -> candidates)
- totalScore
- skillScore
- experienceScore
- educationScore
- keywordScore
- matchingSkills (array)
- missingSkills (array)
- rank
- createdAt, updatedAt
- UNIQUE constraint on (resumeId, jobDescId)

---

## Project Structure
resume-screener/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |   |-- database.js          (Prisma singleton client)
|   |   |-- controllers/
|   |   |   |-- candidateController.js
|   |   |   |-- jobDescriptionController.js
|   |   |   |-- resumeController.js
|   |   |-- middleware/
|   |   |   |-- errorHandler.js
|   |   |   |-- upload.js
|   |   |   |-- validate.js
|   |   |-- routes/
|   |   |   |-- candidates.js
|   |   |   |-- jobDescriptions.js
|   |   |   |-- resumes.js
|   |   |-- services/
|   |   |   |-- jdService.js
|   |   |   |-- parserService.js
|   |   |   |-- scoringService.js
|   |   |-- utils/
|   |       |-- apiResponse.js
|   |       |-- textUtils.js
|   |-- prisma/
|   |   |-- schema.prisma
|   |-- uploads/
|   |-- .env
|   |-- package.json
|   |-- server.js
|
|-- frontend/
|-- src/
|   |-- api/
|   |   |-- index.js
|   |-- components/
|   |   |-- candidates/
|   |   |   |-- CandidateCard.jsx
|   |   |-- layout/
|   |   |   |-- Navbar.jsx
|   |   |-- ui/
|   |   |   |-- Badge.jsx
|   |   |   |-- LoadingSpinner.jsx
|   |   |   |-- ScoreRing.jsx
|   |   |-- upload/
|   |       |-- JDInput.jsx
|   |       |-- ResumeDropzone.jsx
|   |-- context/
|   |   |-- AppContext.jsx
|   |-- pages/
|   |   |-- HomePage.jsx
|   |   |-- NotFound.jsx
|   |   |-- ResultsPage.jsx
|   |   |-- UploadPage.jsx
|   |-- App.jsx
|   |-- index.css
|   |-- main.jsx
|-- .env
|-- index.html
|-- package.json
|-- tailwind.config.js
|-- vite.config.js

---

## Local Setup

### Prerequisites

- Node.js v20 or higher
- npm v9 or higher
- A Neon account at neon.tech (free tier works)
- Git

### Step 1 — Clone the repository
git clone https://github.com/YOUR_USERNAME/resume-screener.git
cd resume-screener

### Step 2 — Backend setup
cd backend
npm install

Create your .env file (see Environment Variables section below).
npx prisma generate
npx prisma migrate deploy
npm run dev

Backend will run at: http://localhost:5000

### Step 3 — Frontend setup
cd frontend
npm install

Create your .env file with:
VITE_API_URL=http://localhost:5000/api

npm run dev

Frontend will run at: http://localhost:5173

### Step 4 — Verify

Open http://localhost:5000/api/health in your browser.
You should see:
{ "status": "ok", "database": "connected" }

---

## Environment Variables

### backend/.env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10&pool_timeout=10&connection_limit=5"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

How to get your Neon URLs:
1. Log in at neon.tech
2. Select your project
3. Click Connection Details
4. Pooled connection string -> DATABASE_URL
5. Direct connection string -> DIRECT_URL

### frontend/.env
VITE_API_URL=http://localhost:5000/api

---

## API Reference

### Job Descriptions

POST   /api/job-descriptions        Create JD from text or file upload
GET    /api/job-descriptions        List all job descriptions
GET    /api/job-descriptions/:id    Get single job description
DELETE /api/job-descriptions/:id    Delete job description

POST body (JSON):
{
"title": "Senior Frontend Engineer",
"content": "We need 3+ years React, TypeScript, Node.js..."
}
Or use multipart/form-data with field jdFile to upload a PDF or DOCX.

### Resumes

POST   /api/resumes/upload     Upload and parse one or more resumes
POST   /api/resumes/analyze    Re-analyze resumes against a JD

POST /api/resumes/upload — multipart/form-data:
- resumes[] — one or more files (PDF, DOC, DOCX)
- jobDescriptionId — UUID of the target job description

### Candidates

GET    /api/candidates                        List all candidates
GET    /api/candidates/results/:jobDescId     Get ranked candidates for a JD
GET    /api/candidates/export/:jobDescId      Download results as CSV

Query parameters for results endpoint:
- search — filter by candidate name (optional)
- sort   — rank or score (default: rank)
- order  — asc or desc (default: asc)

### Standard Response Format

Success:
{
"success": true,
"message": "Operation description",
"data": { ... }
}

Error:
{
"success": false,
"message": "Human readable error message"
}

---

## Deployment

### Backend on Render

1. Push your code to GitHub
2. Go to render.com and create a New Web Service
3. Connect your GitHub repository
4. Use these settings:

   Root Directory:   backend
   Build Command:    npm install && npx prisma generate && npx prisma migrate deploy
   Start Command:    node server.js
   Node Version:     20

5. Add all environment variables from backend/.env
6. Click Deploy

### Frontend on Vercel

1. Go to vercel.com and click Add New Project
2. Import your GitHub repository
3. Use these settings:

   Root Directory:    frontend
   Framework Preset:  Vite
   Build Command:     npm run build
   Output Directory:  dist

4. Add environment variable:
   VITE_API_URL = https://your-render-app.onrender.com/api

5. Click Deploy

---

## Assumptions

1. Resume quality — The parser works best on text-based PDFs. Scanned image-only PDFs will return minimal extracted text because OCR is not implemented.

2. Candidate name extraction — The parser assumes the candidate name appears near the top of the resume as 2 to 5 words without digits or special characters. Non-standard resume layouts may result in "Unknown Candidate."

3. Skills detection — Skills are matched against a curated list of 50+ technology skills. Domain-specific or niche skills not in the list will not contribute to the skills score.

4. Experience years — Only explicitly stated years such as "5 years of experience" are parsed. Experience calculated from date ranges is not supported.

5. Job Description language — The JD must be written in English. The scoring engine extracts requirements from free-form text using regex and keyword matching, not a large language model.

6. File size — Maximum supported file size is 10MB per resume.

7. Concurrent users — The free Neon tier supports limited concurrent connections. For production scale, upgrade to a paid Neon plan and increase connection_limit in DATABASE_URL.

8. Re-uploading — Uploading a resume for a candidate who already exists (matched by name and email) creates a new resume record rather than updating the existing one.

---

## License

MIT License — free to use, modify, and distribute.

---

Built as a full-stack project demonstrating React, Node.js, PostgreSQL, Prisma ORM, and weighted scoring for AI-assisted resume screening.
