import { Link } from 'react-router-dom';
import { FiArrowRight, FiUploadCloud, FiCpu, FiAward } from 'react-icons/fi';

export default function HomePage() {
  const features = [
    {
      icon: <FiUploadCloud className="w-6 h-6 text-cyan-400" />,
      title: 'Bulk Upload',
      desc: 'Upload up to 20 resumes at once. PDF, DOC, and DOCX supported.',
    },
    {
      icon: <FiCpu className="w-6 h-6 text-blue-400" />,
      title: 'Smart Scoring',
      desc: 'Weighted scoring across skills, experience, education, and keyword match.',
    },
    {
      icon: <FiAward className="w-6 h-6 text-violet-400" />,
      title: 'Ranked Results',
      desc: 'Instant candidate ranking with matching and missing skills breakdown.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 overflow-x-hidden">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16 sm:mb-20 pt-8 sm:pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-xs sm:text-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse flex-shrink-0" />
            <span>AI-Powered Resume Screening</span>
          </div>

          <h1 className="font-display font-extrabold text-white leading-tight mb-4 sm:mb-6
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            Hire Smarter,
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Screen Faster
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2">
            Upload resumes, set your job description, and let our scoring engine rank candidates by fit in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold rounded-2xl hover:opacity-90 transition-all text-sm sm:text-base shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
            >
              Get Started
              <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/results"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 border border-slate-700 text-white font-display font-bold rounded-2xl hover:bg-slate-700 transition-all text-sm sm:text-base w-full sm:w-auto"
            >
              View Results
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-6 hover:border-slate-700 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}