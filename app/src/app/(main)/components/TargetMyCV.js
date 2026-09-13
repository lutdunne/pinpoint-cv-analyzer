"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle,
    Lightbulb,
    Target,
    CheckCircle2,
    TrendingUp,
    BookOpen,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Plus,
    Sparkles,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JDMatchSkeleton } from "@/components/Skeletons";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.04
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function TargetMyCV({ feedback, setFeedback }) {
    const [jobDesc, setJobDesc] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        interview: true,
        cover: true,
        allSkills: false,
    });
    const [showHistory, setShowHistory] = useState(true);
    const [jobHistories, setJobHistories] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadJobHistories = async () => {
            try {
                const response = await fetch("/api/job-analyses");
                const data = await response.json();
                if (data.jobAnalyses) {
                    setJobHistories(data.jobAnalyses);
                }
            } catch (err) {
                console.error("Failed to load job histories:", err);
            }
        };
        loadJobHistories();
    }, []);

    const loadJobAnalysis = async (id) => {
        try {
            const response = await fetch(`/api/job-analyses/${id}`);
            const data = await response.json();
            setFeedback(data.analysis);
            setSelectedHistory(id);
        } catch (err) {
            console.error("Failed to load job analysis:", err);
        }
    };

    const handleJobText = async (e) => {
        const resumeText = localStorage.getItem("parsedText");
        e.preventDefault();
        setError(null);

        if (!resumeText || !jobDesc) {
            setError("Please upload a résumé and paste a target job description.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/target", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resumeText,
                    jobDesc,
                }),
            });

            if (!response.ok) {
                let errorMessage = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.details || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const old = JSON.parse(localStorage.getItem("feedback")) || {};
            const updated = { ...old, target: data };
            localStorage.setItem("feedback", JSON.stringify(updated));
            setFeedback(updated);
            setSelectedHistory(null);

            try {
                const histResponse = await fetch("/api/job-analyses");
                const histData = await histResponse.json();
                if (histData.jobAnalyses) {
                    setJobHistories(histData.jobAnalyses);
                }
            } catch (err) {
                console.error("Failed to reload job histories:", err);
            }
        } catch (err) {
            console.error("Analysis failed:", err);
            setError(err.message || "Failed to analyze job description. Please try again.");
        } finally {
            setIsLoading(false);
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
        <div className="flex flex-col w-full p-4 sm:p-6 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-6 overflow-y-auto">
            {/* Top Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground" suppressHydrationWarning>
                    {mounted ? greeting : "Hello"}<span className="text-primary">.</span>
                </h1>
                <p className="text-sm text-foreground-secondary mt-1.5 leading-relaxed">
                    Compare your résumé with any job description to evaluate ATS match and tailored keywords.
                </p>
            </div>

            {/* Previous Analyses History */}
            {jobHistories.length > 0 && (
                <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-card-secondary transition-colors text-left"
                    >
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Previous Job Matches</h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                {jobHistories.length}
                            </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-foreground-secondary transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
                    </button>
                    {showHistory && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-border/60">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                                {jobHistories.slice(0, 6).map((history) => (
                                    <button
                                        key={history.id}
                                        onClick={() => loadJobAnalysis(history.id)}
                                        className="text-left p-4 bg-card-secondary rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-xs group"
                                    >
                                        <div className="flex items-start justify-between mb-1.5 gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                    {history.position || "Untitled Position"}
                                                </p>
                                                <p className="text-xs text-foreground-secondary truncate mt-0.5">
                                                    {history.companyName || "Target Role"}
                                                </p>
                                            </div>
                                            <span className="text-sm font-extrabold text-primary ml-1.5 flex-shrink-0">
                                                {history.matchScore}%
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-foreground-secondary mt-1">
                                            {new Date(history.createdAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Input Form or Results View */}
            {!feedback || (!("match" in feedback) && !("match_score" in feedback)) ? (
                <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-xs">
                    <form onSubmit={handleJobText} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2.5">
                                Target Job Description
                            </label>
                            <textarea
                                className="w-full border border-border rounded-xl p-4 sm:p-5 h-52 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-card-secondary text-foreground placeholder-foreground-secondary text-sm transition resize-none leading-relaxed"
                                placeholder="Paste the complete job posting, requirements, or qualifications here..."
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 mb-2 bg-destructive/10 border border-destructive/20 rounded-xl w-full">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || !jobDesc.trim()}
                            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>{isLoading ? "Analyzing Match..." : "Calculate Job Match"}</span>
                        </button>

                        {isLoading && (
                            <div className="pt-4 space-y-6">
                                <div className="space-y-2 text-center pb-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        Evaluating ATS keyword match, candidate fit, and skills coverage...
                                    </p>
                                </div>
                                <JDMatchSkeleton />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2.5">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span className="leading-relaxed">{error}</span>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Header & Reset Button */}
                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">Match Analysis Results</h2>
                        <button
                            onClick={() => {
                                setFeedback(null);
                                setJobDesc("");
                                setSelectedHistory(null);
                            }}
                            className="flex items-center gap-2 px-3.5 py-2 border border-border text-foreground hover:border-primary hover:text-primary font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-primary" />
                            <span>New Target Match</span>
                        </button>
                    </div>

                    {/* Match Score Hero Card */}
                    <motion.div
                        variants={itemVariants}
                        className="pro-card-gradient pro-glow"
                    >
                        <div className="pro-card-inner p-6 sm:p-8 space-y-5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-foreground-secondary mb-1.5">
                                        <Target className="w-4 h-4 text-primary" />
                                        <p className="text-xs font-bold uppercase tracking-wider">Overall Match Score</p>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">
                                            {feedback?.match_score || feedback?.match}
                                        </span>
                                        <span className="text-xl text-foreground-secondary font-bold">%</span>
                                    </div>
                                </div>

                                {feedback?.application_priority && (
                                    <div className="sm:text-right">
                                        <p className="text-[11px] font-bold text-foreground-secondary uppercase tracking-wider mb-1.5">
                                            Application Priority
                                        </p>
                                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                                            feedback.application_priority === 'high'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                : feedback.application_priority === 'medium'
                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                    : 'bg-muted text-foreground-secondary border border-border'
                                        }`}>
                                            {feedback.application_priority} Priority Fit
                                        </span>
                                    </div>
                                )}
                            </div>

                            {feedback?.match_summary && (
                                <div className="p-4 sm:p-5 rounded-xl bg-card-secondary border border-border">
                                    <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                                        {feedback.match_summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Matching & Missing Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Matching Skills */}
                        {Array.isArray(feedback?.matching_skills) && feedback.matching_skills.length > 0 && (
                            <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 sm:p-7 border border-border/80 card-elevation space-y-4">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <h3 className="text-sm font-bold text-foreground">Matching Skills Found</h3>
                                    <span className="text-xs text-foreground-secondary">({feedback.matching_skills.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                    {feedback.matching_skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-500/20 leading-normal">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Missing Skills / Skills to Develop */}
                        {Array.isArray(feedback?.missing_skills) && feedback.missing_skills.length > 0 && (
                            <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 sm:p-7 border border-border/80 card-elevation space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-4 h-4" />
                                        <h3 className="text-sm font-bold text-foreground">Skills to Highlight / Develop</h3>
                                        <span className="text-xs text-foreground-secondary">({feedback.missing_skills.length})</span>
                                    </div>
                                    {feedback.missing_skills.length > 4 && (
                                        <button
                                            onClick={() => setExpandedSections(prev => ({ ...prev, allSkills: !prev.allSkills }))}
                                            className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                                        >
                                            {expandedSections.allSkills ? "Show less" : `+${feedback.missing_skills.length - 4} more`}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2.5 pt-0.5">
                                    {(expandedSections.allSkills ? feedback.missing_skills : feedback.missing_skills.slice(0, 4)).map((skill, i) => {
                                        const skillObj = typeof skill === 'object' ? skill : { skill, priority: 'important' };
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 bg-card-secondary rounded-xl border border-border text-xs gap-3">
                                                <span className="font-semibold text-foreground leading-normal">{skillObj.skill}</span>
                                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider flex-shrink-0">
                                                    {skillObj.priority || 'important'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Resume Tailoring Suggestions */}
                    {Array.isArray(feedback?.resume_tailoring) && feedback.resume_tailoring.length > 0 && (
                        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 sm:p-7 border border-border/80 card-elevation space-y-4">
                            <div className="flex items-center gap-2.5 text-foreground">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold">Tailoring Recommendations</h3>
                            </div>

                            <div className="space-y-3.5 pt-1">
                                {feedback.resume_tailoring.map((item, i) => (
                                    <div key={i} className="p-4 sm:p-5 bg-card-secondary rounded-xl border border-border space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-primary uppercase tracking-wide">
                                                Section: {item.section}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                                            {item.suggestion}
                                        </p>
                                        {item.example && (
                                            <div className="bg-background rounded-lg p-3 border border-border/70 mt-2">
                                                <p className="text-xs text-foreground-secondary italic leading-relaxed">
                                                    Example: &ldquo;{item.example}&rdquo;
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Interview Prep & Cover Letter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interview Prep Topics */}
                        {Array.isArray(feedback?.interview_preparation) && feedback.interview_preparation.length > 0 && (
                            <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 sm:p-7 border border-border/80 card-elevation space-y-3">
                                <button
                                    onClick={() => setExpandedSections(prev => ({ ...prev, interview: !prev.interview }))}
                                    className="w-full flex items-center justify-between text-left cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground">Interview Prep Topics</h3>
                                        <span className="text-xs text-foreground-secondary">({feedback.interview_preparation.length})</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-foreground-secondary transition-transform duration-200 ${expandedSections.interview ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.interview && (
                                    <ul className="space-y-2.5 pt-2 border-t border-border">
                                        {feedback.interview_preparation.map((topic, i) => (
                                            <li key={i} className="text-xs sm:text-sm text-foreground-secondary flex items-start gap-2 leading-relaxed">
                                                <span className="text-primary font-bold">→</span>
                                                <span className="text-foreground">{topic}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        )}

                        {/* Cover Letter Focus */}
                        {Array.isArray(feedback?.cover_letter_focus) && feedback.cover_letter_focus.length > 0 && (
                            <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 sm:p-7 border border-border/80 card-elevation space-y-3">
                                <button
                                    onClick={() => setExpandedSections(prev => ({ ...prev, cover: !prev.cover }))}
                                    className="w-full flex items-center justify-between text-left cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground">Cover Letter Emphasis</h3>
                                        <span className="text-xs text-foreground-secondary">({feedback.cover_letter_focus.length})</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-foreground-secondary transition-transform duration-200 ${expandedSections.cover ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedSections.cover && (
                                    <ul className="space-y-2.5 pt-2 border-t border-border">
                                        {feedback.cover_letter_focus.map((point, i) => (
                                            <li key={i} className="text-xs sm:text-sm text-foreground-secondary flex items-start gap-2 leading-relaxed">
                                                <span className="text-primary font-bold">→</span>
                                                <span className="text-foreground">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Application Strategy Callout */}
                    {feedback?.suggestions && (
                        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-6 sm:p-7 border-l-4 border-primary border-t border-r border-b border-border/80 card-elevation space-y-2">
                            <div className="flex items-center gap-2 text-foreground">
                                <Lightbulb className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold">Strategic Application Tip</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-normal">
                                {feedback.suggestions}
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}