import { useState } from 'react';
import { FiEdit3, FiFileText } from "react-icons/fi";

export default function JDInput({ onJDChange }) {
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const handleTextChange = (val) => {
    setText(val);
    onJDChange({ mode: 'text', content: val, title });
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    onJDChange({ mode, content: text, file, title: val });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    onJDChange({ mode: 'file', file: f, title });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
        <input
          type="text"
          placeholder="e.g. Senior Frontend Engineer"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 text-sm transition-all"
        />
      </div>

     
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 w-fit">
        {['text', 'file'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              mode === m
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {m === 'text' ? (
                <FiEdit3 className="w-4 h-4" />
              ) : (
                <FiFileText className="w-4 h-4" />
              )}
              <span>{m === 'text' ? 'Type JD' : 'Upload File'}</span>
            </div>
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <textarea
          placeholder="Paste or type your full Job Description here...&#10;&#10;Include required skills, experience, education, responsibilities..."
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          rows={10}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 text-sm resize-none transition-all leading-relaxed"
        />
      ) : (
        <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all">
          <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-center">
            <p className="text-white font-medium">{file ? file.name : 'Upload JD Document'}</p>
            <p className="text-slate-500 text-xs mt-1">PDF, DOC, DOCX</p>
          </div>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
}