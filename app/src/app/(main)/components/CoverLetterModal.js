import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Copy, Check, Loader2, Sparkles, Download } from 'lucide-react';

export default function CoverLetterModal({ isOpen, onClose }) {
  const [targetJob, setTargetJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const resumeText = localStorage.getItem("parsedText");
      if (!resumeText) {
        throw new Error("Could not find your parsed resume. Please try re-uploading.");
      }

      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetJob })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setCoverLetter(data.coverLetter);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setCoverLetter(null);
    setTargetJob('');
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/50">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold">AI Cover Letter</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {!coverLetter && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Target Job context (Optional)
                  </label>
                  <p className="text-xs text-foreground-secondary">
                    Paste a job description, job title, or company name so the AI can tailor your cover letter perfectly.
                  </p>
                  <textarea
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer at Stripe..."
                    className="w-full h-32 p-4 text-sm bg-card-secondary/50 border border-border/80 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-foreground-secondary"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Professional Cover Letter
                </button>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
                  <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Drafting your cover letter...</p>
                  <p className="text-xs text-foreground-secondary">Aligning your experience with the target job.</p>
                </div>
              </motion.div>
            )}

            {coverLetter && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <textarea
                    readOnly
                    value={coverLetter}
                    className="w-full h-96 p-5 text-sm bg-card-secondary/30 border border-border/80 rounded-2xl resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground custom-scrollbar"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-card border border-border rounded-lg shadow-sm hover:bg-card-secondary text-foreground transition-all flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs font-semibold">{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 bg-card-secondary hover:bg-border/60 text-foreground border border-border rounded-2xl font-bold transition-all text-sm"
                  >
                    Generate Another
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to Clipboard' : 'Copy to Clipboard'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
