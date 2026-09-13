"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Star,
  Zap,
  Lock,
  Download,
  FileText,
  Mic,
  MicOff,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { useDeveloperMode } from './DeveloperModeContext';
import { useFeedback } from './FeedbackContext';

// Badge descriptions
const BADGE_INFO = {
  'behavioral': {
    icon: Target,
    fullname: 'Behavioral Interview',
    short: 'Past Experience',
    description: 'Focuses on your past behavior and real work experiences. Best answered using the STAR method.',
    color: 'blue'
  },
  'technical': {
    icon: Zap,
    fullname: 'Technical Interview',
    short: 'Technical Skills',
    description: 'Tests your technical knowledge, coding ability, and problem-solving skills.',
    color: 'indigo'
  },
  'situational': {
    icon: Target,
    fullname: 'Situational',
    short: 'Scenarios',
    description: 'Presents a hypothetical workplace situation and asks how you would handle it.',
    color: 'cyan'
  },
  'leadership': {
    icon: Star,
    fullname: 'Leadership',
    short: 'Leadership Skills',
    description: 'Evaluates your leadership, team management, and strategic decision-making abilities.',
    color: 'purple'
  },
  'entry': {
    icon: Lightbulb,
    fullname: 'Entry Level',
    short: 'Beginner',
    description: 'A straightforward introductory question designed to help you get started.',
    color: 'green'
  },
  'mid': {
    icon: Zap,
    fullname: 'Mid Level',
    short: 'Intermediate',
    description: 'Requires deeper thinking and demonstrates mid-career knowledge and experience.',
    color: 'yellow'
  },
  'senior': {
    icon: Target,
    fullname: 'Senior Level',
    short: 'Advanced',
    description: 'A challenging question that tests expertise and distinguishes exceptional candidates.',
    color: 'red'
  },
  'STAR Method': {
    icon: Star,
    fullname: 'STAR Method',
    short: 'S.T.A.R.',
    description: 'Situation, Task, Action, Result. A proven framework for answering behavioral questions.',
    color: 'green'
  }
};

// Modal Component with Framer Motion
function InfoModal({ isOpen, title, shortName, description, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-semibold text-primary mb-3">{shortName}</p>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">{description}</p>
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl transition shadow-xs"
          >
            Got it
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Badge Button Component
function BadgeButton({ label, onClick }) {
  const info = BADGE_INFO[label];
  if (!info) return null;

  const Icon = info.icon;
  const bgClass =
    info.color === 'blue' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' :
    info.color === 'purple' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
    info.color === 'green' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
    info.color === 'yellow' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
    info.color === 'red' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
    info.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border transition-all hover:scale-105 cursor-pointer ${bgClass}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

// Premium, Modern Skeleton Loader Component
function SkeletonCardsLoader({ progress, freeQuestionsReady }) {
  const stages = [
    { label: "Parsing work history & key accomplishments", min: 0, max: 28 },
    { label: "Formulating tailored behavioral & technical questions", min: 28, max: 60 },
    { label: "Crafting STAR method answering strategies & tips", min: 60, max: 88 },
    { label: "Calibrating recruiter evaluation criteria & metrics", min: 88, max: 100 }
  ];

  const currentStageIndex = stages.findIndex(s => progress >= s.min && progress <= s.max);
  const activeStage = stages[currentStageIndex >= 0 ? currentStageIndex : stages.length - 1];

  return (
    <div className="space-y-6">
      {/* Modern Center Loading Card */}
      <div className="bg-card rounded-3xl card-elevation p-6 sm:p-8 border border-border/80 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Sparkles className="w-6 h-6 animate-pulse text-primary" />
              </div>
              <div className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping pointer-events-none opacity-40" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                AI Interview Coach Generating
              </h3>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {activeStage.label}...
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-card-secondary border border-border/70">
            <span className="text-xl sm:text-2xl font-black text-primary tabular-nums">
              {Math.min(100, Math.round(progress))}
            </span>
            <span className="text-xs font-bold text-foreground-secondary">%</span>
          </div>
        </div>

        {/* Smooth Glowing Progress Bar */}
        <div className="space-y-2">
          <div className="h-2.5 bg-card-secondary rounded-full overflow-hidden p-0.5 border border-border/60">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-[#ff9068] to-primary rounded-full shadow-sm"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step Progression Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-border/60">
          {stages.map((stage, idx) => {
            const isCompleted = progress > stage.max;
            const isCurrent = progress >= stage.min && progress <= stage.max;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium"
                    : isCurrent
                    ? "bg-primary/10 border-primary/30 text-primary font-semibold shadow-xs"
                    : "bg-card-secondary/60 border-border/60 text-foreground-secondary/70 opacity-60"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCompleted
                        ? "bg-emerald-500"
                        : isCurrent
                        ? "bg-primary animate-ping"
                        : "bg-foreground-secondary/40"
                    }`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Step {idx + 1}
                  </span>
                </div>
                <p className="line-clamp-1 text-[11px] leading-snug">
                  {stage.label.split(" ")[0]} {stage.label.split(" ")[1]}...
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shimmering Question Card Previews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-6 bg-card border border-border/80 card-elevation space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-12 rounded-lg skeleton-shimmer" />
              <div className="h-5 w-20 rounded-full skeleton-shimmer" />
            </div>
            <div className="h-4 w-5/6 rounded-md skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="h-3 w-full rounded skeleton-shimmer" />
              <div className="h-3 w-4/5 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InterviewPractice({ feedback: propFeedback, setFeedback: propSetFeedback }) {
  const { 
    feedback, setFeedback,
    interviewLoading: loading, setInterviewLoading: setLoading,
    interviewProgress: progress, setInterviewProgress: setProgress,
    interviewFreeQuestionsReady: freeQuestionsReady, setInterviewFreeQuestionsReady: setFreeQuestionsReady,
    interviewPartialQuestions: partialQuestions, setInterviewPartialQuestions: setPartialQuestions
  } = useFeedback();

  const [expandedQuestions, setExpandedQuestions] = useState({});
  const { isDeveloperMode } = useDeveloperMode();
  const [selectedBadge, setSelectedBadge] = useState(null);

  const isPaid = feedback?.resume?.isPaid || isDeveloperMode;

  const [recordingStates, setRecordingStates] = useState({});
  const [transcripts, setTranscripts] = useState({});
  const [answerFeedback, setAnswerFeedback] = useState({});
  const [loadingFeedback, setLoadingFeedback] = useState({});
  const recognitionRef = useRef(null);

  const [savedText, setSavedText] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedText(localStorage.getItem("parsedText"));
    }
  }, []);

  // Auto-load questions if they were already generated (e.g., after refresh or tab switch)
  useEffect(() => {
    if (feedback?.questions?.length > 0 && !freeQuestionsReady && !loading) {
      setProgress(100);
      setPartialQuestions(feedback.questions.slice(0, 3));
      setFreeQuestionsReady(true);
    }
  }, [feedback, freeQuestionsReady, loading, setProgress, setPartialQuestions, setFreeQuestionsReady]);

  const exportQuestions = async (feedbackData) => {
    if (!feedbackData || !feedbackData.questions) return;

    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    const lineHeight = 5;

    doc.setFontSize(18);
    doc.text('Interview Questions & Preparation Guide', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
    doc.setTextColor(0, 0, 0);

    feedbackData.questions.forEach((q, i) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }

      const questionText = typeof q === 'string' ? q : q.question;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const questionLines = doc.splitTextToSize(`Q${i + 1}: ${questionText}`, contentWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * lineHeight + 4;
    });

    doc.save('interview-questions.pdf');
  };

  const startRecording = (questionIndex) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = transcripts[questionIndex] || '';

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscripts(prev => ({
        ...prev,
        [questionIndex]: finalTranscript + interimTranscript
      }));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setRecordingStates(prev => ({ ...prev, [questionIndex]: false }));
    };

    recognition.onend = () => {
      setRecordingStates(prev => ({ ...prev, [questionIndex]: false }));
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecordingStates(prev => ({ ...prev, [questionIndex]: true }));
  };

  const stopRecording = (questionIndex) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecordingStates(prev => ({ ...prev, [questionIndex]: false }));
  };

  const submitAnswer = async (questionIndex, question) => {
    const answer = transcripts[questionIndex];
    if (!answer || !answer.trim()) {
      alert('Please record an answer first');
      return;
    }

    setLoadingFeedback(prev => ({ ...prev, [questionIndex]: true }));

    try {
      const response = await fetch('/api/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: typeof question === 'string' ? question : question.question,
          answer: answer.trim(),
          questionContext: {
            type: question.type,
            difficulty: question.difficulty,
            tips: question.tips,
            keyPoints: question.key_points_to_cover
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }

      const data = await response.json();
      setAnswerFeedback(prev => ({ ...prev, [questionIndex]: data }));
    } catch (err) {
      console.error('Failed to get answer feedback:', err);
      alert('Failed to analyze your answer. Please try again.');
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handleAnalyse = async () => {
    if (!savedText) return;

    const cachedFeedback = JSON.parse(localStorage.getItem("feedback") || "{}");
    if (cachedFeedback?.interview?.questions && cachedFeedback.interview.questions.length > 0) {
      setLoading(true);
      setProgress(25);
      setTimeout(() => setProgress(75), 150);
      setTimeout(() => {
        setProgress(100);
        setFeedback(cachedFeedback.interview);
        setPartialQuestions(cachedFeedback.interview.questions.slice(0, 3));
        setFreeQuestionsReady(true);
        setLoading(false);
      }, 350);
      return;
    }

    let progressInterval = null;

    try {
      setLoading(true);
      setProgress(4);
      setFreeQuestionsReady(false);
      setPartialQuestions([]);

      const startTime = Date.now();

      // Faster, responsive asymptotic pacing calibrated to ~6-9s OpenAI response
      progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const calculated = Math.min(92, Math.round(92 * (1 - Math.exp(-elapsed / 4.0))));
        setProgress((prev) => Math.max(prev, Math.max(5, calculated)));
      }, 80);

      const response = await fetch("/api/interview-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: savedText.slice(0, 6000) }),
      });

      if (!response.ok) {
        if (progressInterval) clearInterval(progressInterval);
        let errMsg = "Failed to generate interview questions. Please try again.";
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch (e) { /* ignore parse errors */ }
        alert(errMsg);
        setLoading(false);
        setProgress(0);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.done && json.data) {
                finalData = json.data;
                if (progressInterval) clearInterval(progressInterval);
                setProgress(100);
                if (json.data.questions && json.data.questions.length >= 3) {
                  setPartialQuestions(json.data.questions.slice(0, 3));
                  setFreeQuestionsReady(true);
                }
              }
            } catch (e) {
              console.error('Failed to parse streaming data:', e);
            }
          }
        }
      }

      if (finalData) {
        const old = JSON.parse(localStorage.getItem("feedback")) || {};
        const updated = { ...old, interview: finalData };
        localStorage.setItem("feedback", JSON.stringify(updated));
        // Smooth 400ms buffer so user sees 100% completion & all steps verified
        await new Promise((r) => setTimeout(r, 400));
        setFeedback(updated);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const [greeting, setGreeting] = useState("Hello");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground" suppressHydrationWarning>
            {mounted ? greeting : "Hello"}<span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-foreground-secondary mt-1">Practice role-specific interview questions tailored to your CV.</p>
        </div>

        {savedText && !feedback?.questions && !loading && (
          <button
            onClick={handleAnalyse}
            disabled={loading}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Questions</span>
          </button>
        )}
      </div>

      {/* Loading Progress State */}
      {loading && (
        <div className="space-y-6">
          <SkeletonCardsLoader progress={progress} freeQuestionsReady={freeQuestionsReady} />
        </div>
      )}

      {/* Results Section */}
      {!loading && feedback?.interview?.questions && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl card-elevation p-6 sm:p-7 space-y-5 border border-border/80">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Interview Questions</h2>
                <span className="text-xs text-foreground-secondary">AI-personalized based on your work history</span>
              </div>
              {isPaid && (
                <button
                  onClick={() => exportQuestions(feedback.interview)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-card-secondary hover:bg-card-secondary/80 border border-border text-foreground font-semibold rounded-xl transition text-xs shadow-xs cursor-pointer active:scale-98"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Export Questions</span>
                </button>
              )}
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 }
                }
              }}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {feedback.interview.questions.map((q, i) => {
                const isLocked = !isPaid && i >= 3;
                const questionText = typeof q === 'string' ? q : q.question;
                const questionType = typeof q === 'object' ? q.type : null;
                const difficulty = typeof q === 'object' ? q.difficulty : null;
                const tips = typeof q === 'object' ? q.tips : null;
                const whyAsked = typeof q === 'object' ? q.why_asked : null;
                const keyPoints = typeof q === 'object' ? q.key_points_to_cover : null;
                const starApplicable = typeof q === 'object' ? q.star_applicable : null;
                const isExpanded = expandedQuestions[i];
                const hasDetails = tips || keyPoints || whyAsked;

                return (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                    className={`bg-card-secondary/60 rounded-2xl border transition-all ${
                      isLocked
                        ? 'border-border relative overflow-hidden'
                        : 'border-border hover:border-primary/40 hover:shadow-xs'
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute inset-0 bg-card/85 backdrop-blur-xs z-10 flex items-center justify-center p-6">
                        <div className="text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-sm text-foreground">Premium Question</p>
                          <p className="text-xs text-foreground-secondary">Upgrade to view and practice this question</p>
                        </div>
                      </div>
                    )}

                    <div className={`p-4 sm:p-5 ${isLocked ? 'blur-xs' : ''}`}>
                      <div className="flex items-start gap-3.5">
                        <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          Q{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-foreground leading-relaxed font-semibold mb-3">
                            {questionText}
                          </p>

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex gap-2 flex-wrap">
                              {questionType && (
                                <BadgeButton label={questionType} onClick={() => setSelectedBadge(questionType)} />
                              )}
                              {difficulty && (
                                <BadgeButton label={difficulty} onClick={() => setSelectedBadge(difficulty)} />
                              )}
                              {starApplicable && (
                                <BadgeButton label="STAR Method" onClick={() => setSelectedBadge("STAR Method")} />
                              )}
                            </div>

                            {hasDetails && (
                              <button
                                onClick={() => setExpandedQuestions(prev => ({ ...prev, [i]: !prev[i] }))}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-semibold transition"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Hide Tips</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <span>Show Strategy</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && hasDetails && !isLocked && (
                      <div className="border-t border-border bg-card p-5 space-y-4 rounded-b-2xl">
                        {whyAsked && (
                          <div className="flex gap-3">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-foreground mb-0.5">Why Interviewers Ask This:</p>
                              <p className="text-xs text-foreground-secondary leading-relaxed">{whyAsked}</p>
                            </div>
                          </div>
                        )}

                        {tips && tips.length > 0 && (
                          <div className="flex gap-3">
                            <div className="w-4 h-4 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
                              ✓
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground mb-1.5">Answering Tips:</p>
                              <ul className="space-y-1">
                                {tips.map((tip, idx) => (
                                  <li key={idx} className="text-xs text-foreground-secondary leading-relaxed flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {keyPoints && keyPoints.length > 0 && (
                          <div className="flex gap-3">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
                              ★
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground mb-1.5">Key Points to Cover:</p>
                              <ul className="space-y-1">
                                {keyPoints.map((point, idx) => (
                                  <li key={idx} className="text-xs text-foreground-secondary leading-relaxed flex gap-2">
                                    <span className="text-emerald-500">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Interactive Practice Audio / Speech */}
                        <div className="border-t border-border pt-4 mt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Mic className="w-4 h-4 text-primary" />
                            <p className="text-xs font-bold text-foreground">Practice Answering (Speech-to-Text):</p>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {!recordingStates[i] ? (
                              <button
                                onClick={() => startRecording(i)}
                                className="flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                <span>Record Answer</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => stopRecording(i)}
                                className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all animate-pulse"
                              >
                                <MicOff className="w-3.5 h-3.5" />
                                <span>Stop Recording</span>
                              </button>
                            )}

                            {transcripts[i] && !loadingFeedback[i] && (
                              <button
                                onClick={() => submitAnswer(i, q)}
                                className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Get AI Feedback</span>
                              </button>
                            )}

                            {loadingFeedback[i] && (
                              <div className="flex items-center gap-2 px-3.5 py-2 text-xs text-foreground-secondary font-medium">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                <span>Analyzing your response...</span>
                              </div>
                            )}
                          </div>

                          {transcripts[i] && (
                            <div className="bg-card-secondary border border-border rounded-xl p-3.5 mb-3">
                              <p className="text-[11px] font-bold text-foreground-secondary uppercase tracking-wider mb-1">Your Spoken Answer:</p>
                              <p className="text-xs text-foreground leading-relaxed">{transcripts[i]}</p>
                            </div>
                          )}

                          {answerFeedback[i] && (
                            <div className="bg-card-secondary/70 border border-border rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Evaluation
                                </p>
                                <span className="text-sm font-extrabold text-primary">{answerFeedback[i].score}/10</span>
                              </div>

                              {answerFeedback[i].strengths && answerFeedback[i].strengths.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Strengths:</p>
                                  <ul className="space-y-1">
                                    {answerFeedback[i].strengths.map((s, idx) => (
                                      <li key={idx} className="text-xs text-foreground-secondary flex gap-2">
                                        <span className="text-emerald-500">•</span>
                                        <span>{typeof s === 'string' ? s : s?.explanation || JSON.stringify(s)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {answerFeedback[i].improvements && answerFeedback[i].improvements.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Suggestions for improvement:</p>
                                  <ul className="space-y-1">
                                    {answerFeedback[i].improvements.map((imp, idx) => (
                                      <li key={idx} className="text-xs text-foreground-secondary flex gap-2">
                                        <span className="text-amber-500">•</span>
                                        <span>{typeof imp === 'string' ? imp : imp?.explanation || JSON.stringify(imp)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom Common Pitfalls & Preparation Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {feedback.common_pitfalls && feedback.common_pitfalls.length > 0 && (
              <div className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border border-border">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Common Interview Pitfalls</h3>
                </div>
                <ul className="space-y-2.5">
                  {feedback.common_pitfalls.map((pitfall, i) => (
                    <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      <span className="text-destructive font-bold">•</span>
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.preparation_tips && feedback.preparation_tips.length > 0 && (
              <div className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border border-border">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Preparation Best Practices</h3>
                </div>
                <ul className="space-y-2.5">
                  {feedback.preparation_tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge Info Modal */}
      {selectedBadge && (
        <InfoModal
          isOpen={!!selectedBadge}
          title={BADGE_INFO[selectedBadge]?.fullname || selectedBadge}
          shortName={BADGE_INFO[selectedBadge]?.short || selectedBadge}
          description={BADGE_INFO[selectedBadge]?.description || ''}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </>
  );
}
