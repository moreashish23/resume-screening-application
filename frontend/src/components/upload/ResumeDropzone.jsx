import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

export default function ResumeDropzone({ onFilesSelected, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef();

 
  const handleFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f =>
      ['.pdf', '.doc', '.docx'].some(ext => f.name.toLowerCase().endsWith(ext))
    );
    if (valid.length === 0) return;

    setFiles(prev => {
      const merged = [...prev, ...valid];
      
      setTimeout(() => onFilesSelected(merged), 0);
      return merged;
    });
  }, [onFilesSelected]);

  const removeFile = useCallback((idx) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      setTimeout(() => onFilesSelected(updated), 0);
      return updated;
    });
  }, [onFilesSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }, [disabled]);

  return (
    <div className="space-y-4">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : disabled
            ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed opacity-50'
            : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500/60 hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
            <FiUploadCloud className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-lg">Drop resumes here</p>
            <p className="text-slate-400 text-sm mt-1">PDF, DOC, DOCX — up to 20 files</p>
          </div>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs border border-cyan-500/30 font-medium">
            Browse files
          </span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FiFile className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-300 text-xs truncate flex-1">{f.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}