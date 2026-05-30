import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeDropzone from '../components/upload/ResumeDropzone';
import JDInput from '../components/upload/JDInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { resumeAPI, jdAPI } from '../api';
import { useApp } from '../context/AppContext';

export default function UploadPage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [jdData, setJdData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [step, setStep] = useState('jd');

  // useCallback prevents new function reference on each render
  const handleFilesSelected = useCallback((selected) => {
    setFiles(selected);
  }, []);

  const handleJDChange = useCallback((data) => {
    setJdData(data);
  }, []);

  const handleSubmit = async () => {
    if (!jdData?.content && !jdData?.file) {
      setError('Please provide a Job Description.');
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least one resume.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    try {
      // Step 1: Create JD
      let jd;
      if (jdData.mode === 'file' && jdData.file) {
        const fd = new FormData();
        fd.append('jdFile', jdData.file);
        if (jdData.title) fd.append('title', jdData.title);
        const res = await jdAPI.create(fd);
        jd = res.data;
      } else {
        const res = await jdAPI.create({
          title: jdData.title || 'Job Description',
          content: jdData.content,
        });
        jd = res.data;
      }

      dispatch({ type: 'SET_JD', payload: jd });

      // Step 2: Upload resumes
      const fd = new FormData();
      files.forEach(f => fd.append('resumes', f));
      fd.append('jobDescriptionId', jd.id);

      await resumeAPI.upload(fd, setProgress);

      navigate(`/results?jdId=${jd.id}`);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const jdIsReady = !!(jdData?.content?.trim() || jdData?.file);

  return (
    <div className="min-h-screen pt-20 pb-16 overflow-x-hidden">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-8 text-center">
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl mb-2">
            New Screening
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Set up your job description and upload candidate resumes
          </p>
        </div>

        {/* Step tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-6 sm:mb-8">
          {[
            { key: 'jd', label: '1 · Job Description' },
            { key: 'resumes', label: '2 · Resumes' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStep(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all ${
                step === tab.key
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-8">
          {step === 'jd' && (
            <div>
              <h2 className="font-display font-bold text-white text-xl mb-5">Job Description</h2>
              <JDInput onJDChange={handleJDChange} />
              <button
                onClick={() => setStep('resumes')}
                disabled={!jdIsReady}
                className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Next: Upload Resumes
              </button>
            </div>
          )}

          {step === 'resumes' && (
            <div>
              <h2 className="font-display font-bold text-white text-xl mb-5">Upload Resumes</h2>
              <ResumeDropzone onFilesSelected={handleFilesSelected} disabled={loading} />

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {loading && (
                <div className="mt-6 text-center">
                  <LoadingSpinner text={`Processing${progress > 0 ? ` ${progress}%` : '...'}`} />
                  <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(progress, 5)}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || files.length === 0}
                className="mt-6 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-display font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading
                  ? 'Processing...'
                  : `Screen ${files.length > 0 ? files.length : ''} Resume${files.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}