import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { candidateAPI, jdAPI } from '../api';
import CandidateCard from '../components/candidates/CandidateCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FiDownload, FiSearch, FiAward, FiBarChart2, FiInbox } from 'react-icons/fi';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const jdId = searchParams.get('jdId');

  const [jds, setJds] = useState([]);
  const [selectedJdId, setSelectedJdId] = useState(jdId || '');
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [error, setError] = useState('');

  useEffect(() => {
    jdAPI.getAll()
      .then(res => {
        const list = res.data || [];
        setJds(list);
        if (!selectedJdId && list.length > 0) {
          setSelectedJdId(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedJdId) return;
    setLoading(true);
    setError('');
    candidateAPI.getRanked(selectedJdId)
      .then(res => {
        const data = res.data || [];
        setCandidates(data);
        setFiltered(data);
      })
      .catch(err => setError(err.message || 'Failed to load candidates'))
      .finally(() => setLoading(false));
  }, [selectedJdId]);

  useEffect(() => {
    let result = [...candidates];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.candidate?.name?.toLowerCase().includes(q));
    }
    result.sort((a, b) =>
      sortBy === 'score'
        ? b.totalScore - a.totalScore
        : (a.rank ?? 999) - (b.rank ?? 999)
    );
    setFiltered(result);
  }, [search, sortBy, candidates]);

  const handleExport = async () => {
    try {
      const res = await candidateAPI.exportCSV(selectedJdId);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'candidates.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    }
  };

  const selectedJd = jds.find(j => j.id === selectedJdId);
  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, c) => s + c.totalScore, 0) / filtered.length)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl">Results</h1>
            {selectedJd && (
              <p className="text-slate-400 text-sm mt-1 truncate max-w-xs">{selectedJd.title}</p>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={!selectedJdId || filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* JD Selector */}
        {jds.length > 0 && (
          <div className="mb-5">
            <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">
              Select Job Description
            </label>
            <select
              value={selectedJdId}
              onChange={e => setSelectedJdId(e.target.value)}
              className="w-full sm:w-auto sm:min-w-64 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/60 appearance-none"
            >
              {jds.map(jd => (
                <option key={jd.id} value={jd.id}>{jd.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 text-sm"
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-800/50 border border-slate-700/50 rounded-xl self-start">
            <button
              onClick={() => setSortBy('rank')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'rank'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiAward className="w-4 h-4" />
              Rank
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'score'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              Score
            </button>
          </div>
        </div>

        {/* Stats */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm">
              <span className="text-slate-400">Total: </span>
              <span className="text-white font-bold">{filtered.length}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm">
              <span className="text-slate-400">Top Score: </span>
              <span className="text-emerald-300 font-bold">{filtered[0]?.totalScore ?? 0}%</span>
            </div>
            <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm">
              <span className="text-slate-400">Avg Score: </span>
              <span className="text-white font-bold">{avgScore}%</span>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading candidates..." />
          </div>
        ) : error ? (
          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm text-center">
            {error}
          </div>
        ) : !selectedJdId ? (
          <div className="text-center py-16">
            <FiInbox className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="font-display font-bold text-white text-lg mb-2">No job description selected</p>
            <p className="text-slate-400 text-sm">Create a job description first from the Upload page.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiInbox className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="font-display font-bold text-white text-lg mb-2">No candidates yet</p>
            <p className="text-slate-400 text-sm">Upload resumes against this job description to see results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map(analysis => (
              <CandidateCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}