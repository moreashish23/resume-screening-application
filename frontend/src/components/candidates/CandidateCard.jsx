import ScoreRing from '../ui/ScoreRing';
import Badge from '../ui/Badge';
import { FiExternalLink, FiUser } from 'react-icons/fi';

export default function CandidateCard({ analysis }) {
  const {
    candidate, resume, totalScore, skillScore, experienceScore,
    educationScore, keywordScore, matchingSkills, missingSkills, rank,
  } = analysis;

  const badgeVariant = totalScore >= 75 ? 'green' : totalScore >= 50 ? 'amber' : 'red';

  const scoreBars = [
    { label: 'Skills', value: skillScore, color: 'bg-cyan-500' },
    { label: 'Experience', value: experienceScore, color: 'bg-blue-500' },
    { label: 'Education', value: educationScore, color: 'bg-violet-500' },
    { label: 'Keywords', value: keywordScore, color: 'bg-amber-500' },
  ];

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 overflow-hidden">
      {/* Rank badge */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
        <span className="text-xs font-display font-bold text-slate-300">#{rank}</span>
      </div>

      <div className="flex items-start gap-4 pr-10">
        <ScoreRing score={totalScore} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-white text-base truncate">
              {candidate?.name || 'Unknown'}
            </h3>
            <Badge variant={badgeVariant}>{totalScore}%</Badge>
          </div>
          {candidate?.email && (
            <p className="text-slate-500 text-xs mt-0.5 truncate">{candidate.email}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
            {resume?.education && (
              <span className="flex items-center gap-1">
                <FiUser className="w-3 h-3" />
                {resume.education}
              </span>
            )}
            {resume?.yearsExp && <span>{resume.yearsExp}y exp</span>}
          </div>
        </div>
      </div>

      {/* Score bars */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {scoreBars.map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500 text-xs">{label}</span>
              <span className="text-slate-400 text-xs">{Math.round(value)}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-700`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Matching Skills */}
      {matchingSkills?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Matching</p>
          <div className="flex flex-wrap gap-1">
            {matchingSkills.slice(0, 5).map(s => (
              <Badge key={s} variant="green">{s}</Badge>
            ))}
            {matchingSkills.length > 5 && (
              <Badge variant="slate">+{matchingSkills.length - 5}</Badge>
            )}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Missing</p>
          <div className="flex flex-wrap gap-1">
            {missingSkills.slice(0, 4).map(s => (
              <Badge key={s} variant="red">{s}</Badge>
            ))}
            {missingSkills.length > 4 && (
              <Badge variant="slate">+{missingSkills.length - 4}</Badge>
            )}
          </div>
        </div>
      )}

      {/* File link */}
      {resume?.filePath && (
        <a
          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${resume.filePath}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <FiExternalLink className="w-3 h-3" />
          View Resume
        </a>
      )}
    </div>
  );
}