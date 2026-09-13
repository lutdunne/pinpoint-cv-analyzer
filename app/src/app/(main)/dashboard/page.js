"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Target,
	FileText,
	CheckCircle,
	AlertCircle,
	AlertTriangle,
	Repeat,
	CircleUserRound,
	Lock,
	Check,
	X,
	XCircle,
	Lightbulb,
	Sparkles,
	TrendingUp,
	Shield,
	Clock,
	Eye,
	ChevronDown,
	Wrench,
	ListOrdered,
	Search,
	Layers,
	Tags,
	LineChart,
	Briefcase,
	Percent,
	BookOpen,
	Zap,
	Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useView } from "../components/ViewContext";
import { useFeedback } from "../components/FeedbackContext";
import { useDeveloperMode } from "../components/DeveloperModeContext";
import { PaymentModal } from "@/components/PaymentModal";
import InterviewPractice from "../components/InterviewPractice";
import TargetMyCV from "../components/TargetMyCV";
import CoverLetterModal from "../components/CoverLetterModal";
import { PDFViewer } from "../components/PDFViewer";
import {
	DashboardSkeleton,
	InterviewSkeleton,
	JDMatchSkeleton,
	PDFViewerSkeleton
} from "@/components/Skeletons";
import { generateReport } from "../components/generateReport";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.07,
			delayChildren: 0.04
		}
	},
	exit: {
		opacity: 0,
		y: -8,
		transition: { duration: 0.2 }
	}
};

const itemVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: [0.22, 1, 0.36, 1]
		}
	}
};

function DashboardContent() {
	const { currentView } = useView();
	const { feedback, setFeedback } = useFeedback();
	const { isDeveloperMode } = useDeveloperMode();
	const [fileUrl, setFileUrl] = useState(null);
	const [greeting, setGreeting] = useState("Hello");
	const [mounted, setMounted] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [showDeepDive, setShowDeepDive] = useState(false);
	const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);

	const isPaid = feedback?.resume?.isPaid || false;

	useEffect(() => {
		setMounted(true);
		const hour = new Date().getHours();
		if (hour < 12) setGreeting("Good morning");
		else if (hour < 18) setGreeting("Good afternoon");
		else setGreeting("Good evening");
	}, []);

	useEffect(() => {
		const storedUrl = localStorage.getItem("fileUrl");
		if (storedUrl) {
			setFileUrl(storedUrl);
		}
	}, []);

	// Helper to calculate sections status based on raw text headers
	const getSectionsStatus = () => {
		const rawText = typeof window !== 'undefined' ? (localStorage.getItem("rawParsedText") || localStorage.getItem("parsedText") || "") : "";
		
		const coreSections = [
			{ name: "Experience", patterns: [/experience/i, /employment/i, /workhistory/i, /history/i] },
			{ name: "Education", patterns: [/education/i, /academic/i, /qualifications/i] },
			{ name: "Skills", patterns: [/skills/i, /technologies/i, /competencies/i] },
		];

		const found = [];
		const missing = [];

		if (!rawText) {
			return { missing: coreSections.map(s => [s.name, "missing"]), total: coreSections.length, hasMissing: true };
		}

		coreSections.forEach(sec => {
			const isFound = sec.patterns.some(pattern => pattern.test(rawText));
			if (isFound) found.push([sec.name, true]);
			else missing.push([sec.name, "missing"]);
		});

		return {
			missing,
			total: coreSections.length,
			hasMissing: missing.length > 0
		};
	};

	// Helper to extract ATS keywords
	const getATSKeywords = () => {
		if (!feedback?.resume) return { foundKeywords: [], missingKeywords: [] };
		const r = feedback.resume;
		
		let found = r.ats_keywords_found || r.keywords || [];
		let missing = r.ats_keywords_missing || r.missing_keywords || [];

		if (r.keyword_analysis) {
			found = r.keyword_analysis.strong_keywords || found;
			missing = r.keyword_analysis.missing_keywords || missing;
		}

		return {
			foundKeywords: Array.isArray(found) ? found : [],
			missingKeywords: Array.isArray(missing) ? missing : []
		};
	};

	const getVocabularyRepetition = () => {
		const rawText = typeof window !== 'undefined' ? (localStorage.getItem("rawParsedText") || localStorage.getItem("parsedText") || "") : "";
		if (!rawText) return [];

		const words = rawText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 4);
		
		const stopWords = new Set(["about", "above", "after", "again", "against", "all", "and", "any", "are", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "her", "here", "hers", "herself", "him", "himself", "his", "how", "into", "its", "itself", "just", "more", "most", "must", "myself", "now", "off", "once", "only", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "too", "under", "until", "very", "was", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your", "yours", "yourself", "yourselves", "using", "used"]);

		const wordCounts = {};
		words.forEach(w => {
			if (!stopWords.has(w)) {
				wordCounts[w] = (wordCounts[w] || 0) + 1;
			}
		});

		const overused = Object.entries(wordCounts)
			.filter(([, count]) => count > 5)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([word]) => word);

		return overused;
	};

	const sections = getSectionsStatus();
	const atsKeywords = getATSKeywords();
	const repeatedWordsList = getVocabularyRepetition();

	return (
		<main className={`flex-1 bg-background ${currentView === 'pdf' ? 'h-[calc(100vh-65px)] overflow-hidden flex flex-col' : 'min-h-screen overflow-y-auto'}`}>
			{/* Payment Modal */}
			<PaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				score={feedback?.resume?.score || 0}
				onPaymentSuccess={() => {
					setShowPaymentModal(false);
					if (feedback?.resume) {
						const updated = {
							...feedback,
							resume: { ...feedback.resume, isPaid: true }
						};
						setFeedback(updated);
						localStorage.setItem("feedback", JSON.stringify(updated));
					}
				}}
			/>

			{/* Cover Letter Modal */}
			<CoverLetterModal
				isOpen={showCoverLetterModal}
				onClose={() => setShowCoverLetterModal(false)}
			/>

			<AnimatePresence mode="wait">
				{currentView === "resume" && (
					<motion.div
						key="resume"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="flex flex-col w-full p-4 sm:p-6 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-6"
					>
						{/* Top Greeting Header */}
						<motion.div variants={itemVariants}>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground" suppressHydrationWarning>
								{mounted ? greeting : "Hello"}<span className="text-primary">.</span>
							</h1>
							<p className="text-sm text-foreground-secondary mt-1">
								Here is your comprehensive résumé quality score and personalized improvement roadmap.
							</p>
						</motion.div>

						{!feedback?.resume ? (
							<DashboardSkeleton />
						) : (
							<>
								{/* Overall Score Summary Hero Card */}
								<motion.div
									variants={itemVariants}
									className="relative rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation overflow-hidden"
								>
									<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
										<div className="space-y-2.5">
											<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
												<Sparkles className="w-3.5 h-3.5" />
												<span>AI Quality Assessment</span>
											</div>
											<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
												Overall Score: <span className="text-primary">{feedback.resume.score}%</span>
											</h2>
											<p className="text-xs sm:text-sm text-foreground-secondary max-w-2xl leading-relaxed">
												{feedback.resume.summary || "Your résumé has been evaluated across ATS parsing, action-driven metrics, section completeness, and vocabulary richness."}
											</p>
										</div>

										<div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
											<div className="flex items-baseline gap-1">
												<span className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">
													{feedback.resume.score}
												</span>
												<span className="text-xl text-foreground-secondary font-semibold">/100</span>
											</div>
											<span className="text-xs font-semibold text-foreground-secondary mb-2">
												{feedback.resume.score >= 80 ? "Top 10% ATS Candidate" : feedback.resume.score >= 60 ? "Competitive Profile" : "Requires Optimization"}
											</span>
											{(isPaid || isDeveloperMode) && (
												<div className="flex items-center gap-2">
													<button
														onClick={() => setShowCoverLetterModal(true)}
														className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition-all shadow-xs cursor-pointer active:scale-95"
													>
														<FileText className="w-3.5 h-3.5" />
														<span>Generate Cover Letter</span>
													</button>
													<button
														onClick={() => generateReport(feedback.resume)}
														className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-xs cursor-pointer active:scale-95"
													>
														<Download className="w-3.5 h-3.5" />
														<span>Download Report</span>
													</button>
												</div>
											)}
										</div>
									</div>
								</motion.div>

								{/* Score Breakdown (Deterministic Checklist) */}
								{feedback.resume.score_breakdown && (
									<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation overflow-hidden">
										<div className="flex items-center gap-2.5 mb-4 text-foreground">
											<div className="p-2 rounded-xl bg-primary/10 text-primary">
												<CheckCircle className="w-5 h-5" />
											</div>
											<h3 className="text-base font-bold">Mathematical Score Breakdown</h3>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
											{feedback.resume.score_breakdown.map((item, i) => (
												<div key={i} className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${item.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
													<span>{item.label}</span>
													{item.passed ? (
														<CheckCircle className="w-4 h-4 flex-shrink-0" />
													) : (
														<XCircle className="w-4 h-4 flex-shrink-0" />
													)}
												</div>
											))}
										</div>
									</motion.div>
								)}

								{/* 3-Column Core Analysis Grid */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* Key Strengths */}
									<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation relative flex flex-col justify-between">
											<div>
										<div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-3.5">
								<div className="p-2 rounded-xl bg-emerald-500/10">
									<Sparkles className="w-5 h-5" />
								</div>
								<h3 className="text-base font-bold text-foreground">Key Strengths</h3>
							</div>
												<ul className="space-y-2.5 text-xs sm:text-sm text-foreground max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
													{Array.isArray(feedback.resume?.strengths) && feedback.resume.strengths.length > 0 ? (
														<>
															{feedback.resume.strengths.slice(0, (isPaid || isDeveloperMode) ? undefined : 2).map((s, i) => {
																const text = typeof s === 'string'
																	? s
																	: s?.explanation || s?.point || s?.strength || JSON.stringify(s);

																return (
																	<li key={i} className="flex items-start gap-2">
																		<CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
																		<span className="leading-relaxed">{text}</span>
																	</li>
																);
															})}
															{!(isPaid || isDeveloperMode) && feedback.resume.strengths.length > 2 && (
																<li className="text-xs text-foreground-secondary italic mt-1">
																	+{feedback.resume.strengths.length - 2} more strengths identified
																</li>
															)}
														</>
													) : (
														<li className="text-xs text-foreground-secondary italic">No specific strengths identified in this analysis.</li>
													)}
												</ul>

												{!(isPaid || isDeveloperMode) && feedback.resume?.strengths?.length > 2 && (
													<div className="mt-4 pt-4 border-t border-border">
														<button
															onClick={() => setShowPaymentModal(true)}
															className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98"
														>
															<Lock className="w-3.5 h-3.5" />
															Unlock All {feedback.resume.strengths.length} Strengths
														</button>
													</div>
												)}
											</div>

											<div className="mt-5 pt-4 border-t border-border">
												<h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
													<Lightbulb className="h-3.5 w-3.5 text-primary" />
													What Makes a Strong CV?
												</h4>
												<p className="text-xs text-foreground-secondary leading-relaxed">
													Quantifiable impact, high-density industry keywords, and consistent reverse-chronological structure.
												</p>
											</div>
										</motion.div>

									{/* Improvements */}
									<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation relative flex flex-col justify-between">
											<div>
												<div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-3.5">
													<div className="p-2 rounded-xl bg-amber-500/10">
														<Wrench className="w-5 h-5" />
													</div>
													<h3 className="text-base font-bold text-foreground">Improvements</h3>
												</div>
												<ul className="space-y-2.5 text-xs sm:text-sm text-foreground max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
													{Array.isArray(feedback.resume?.improvements) && feedback.resume.improvements.length > 0 ? (
														<>
															{feedback.resume.improvements.slice(0, (isPaid || isDeveloperMode) ? undefined : 2).map((w, i) => {
																const text = typeof w === 'string'
																	? w
																	: w?.explanation || w?.fix || w?.issue || JSON.stringify(w);

																return (
																	<li key={i} className="flex items-start gap-2">
																		<AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
																		<span className="leading-relaxed">{text}</span>
																	</li>
																);
															})}
															{!(isPaid || isDeveloperMode) && feedback.resume.improvements.length > 2 && (
																<li className="text-xs text-foreground-secondary italic mt-1">
																	+{feedback.resume.improvements.length - 2} more recommendations
																</li>
															)}
														</>
													) : (
														<li className="text-xs text-foreground-secondary flex items-center gap-2">
															<CheckCircle className="w-4 h-4 text-emerald-500" />
															No major improvements needed!
														</li>
													)}
												</ul>

												{!(isPaid || isDeveloperMode) && feedback.resume?.improvements?.length > 2 && (
													<div className="mt-4 pt-4 border-t border-border">
														<button
															onClick={() => setShowPaymentModal(true)}
															className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98"
														>
															<Lock className="w-3.5 h-3.5" />
															Unlock All {feedback.resume.improvements.length} Improvements
														</button>
													</div>
												)}
											</div>

											<div className="mt-5 pt-4 border-t border-border">
												<h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
													<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
													Common Fix Areas
												</h4>
												<p className="text-xs text-foreground-secondary leading-relaxed">
													Replace vague bullet points with specific action verbs and measurable outcome metrics.
												</p>
											</div>
										</motion.div>

									{/* Action Plan */}
									<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation relative flex flex-col justify-between">
											<div>
												<div className="flex items-center gap-2.5 text-primary mb-3.5">
								<div className="p-2 rounded-xl bg-primary/10">
									<ListOrdered className="w-5 h-5" />
								</div>
								<h3 className="text-base font-bold text-foreground">Action Plan</h3>
							</div>
												<ul className="space-y-2.5 text-xs sm:text-sm text-foreground max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
													{Array.isArray(feedback.resume?.action_plan) && feedback.resume.action_plan.length > 0 ? (
														<>
															{feedback.resume.action_plan.slice(0, (isPaid || isDeveloperMode) ? undefined : 2).map((a, i) => {
																const text = typeof a === 'string'
																	? a
																	: a?.explanation || a?.detail || a?.step || JSON.stringify(a);

																return (
																	<li key={i} className="flex items-start gap-2">
																		<div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
																			{i + 1}
																		</div>
																		<span className="leading-relaxed">{text}</span>
																	</li>
																);
															})}
															{!(isPaid || isDeveloperMode) && feedback.resume.action_plan.length > 2 && (
																<li className="text-xs text-foreground-secondary italic mt-1">
																	+{feedback.resume.action_plan.length - 2} more action steps
																</li>
															)}
														</>
													) : (
														<li className="text-xs text-foreground-secondary flex items-center gap-2">
															<CheckCircle className="w-4 h-4 text-emerald-500" />
															Your CV is in great shape!
														</li>
													)}
												</ul>

												{!(isPaid || isDeveloperMode) && feedback.resume?.action_plan?.length > 2 && (
													<div className="mt-4 pt-4 border-t border-border">
														<button
															onClick={() => setShowPaymentModal(true)}
															className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98"
														>
															<Lock className="w-3.5 h-3.5" />
															Unlock All {feedback.resume.action_plan.length} Steps
														</button>
													</div>
												)}
											</div>

											<div className="mt-5 pt-4 border-t border-border">
												<h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
													<Clock className="h-3.5 w-3.5 text-primary" />
													Implementation Strategy
												</h4>
												<p className="text-xs text-foreground-secondary leading-relaxed">
													Fix high-priority items first, re-upload to track improvements, then tailor for target roles.
												</p>
											</div>
										</motion.div>
								</div>

								{/* Premium Feature Previews (Locked with Modern Gradient Borders & Glow) */}
								{/* Premium Features: ATS Tips & Missing Keywords */}
								<motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* ATS Tips */}
									<div className={!(isPaid || isDeveloperMode) ? "pro-card-gradient pro-glow" : "rounded-2xl bg-card border border-border/80 card-elevation"}>
										<div className={`${!(isPaid || isDeveloperMode) ? "pro-card-inner" : ""} p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between h-full`}>
											<div>
												<div className="flex justify-between items-start mb-3">
													<div className="flex items-center gap-2">
														<div className="p-2 rounded-xl bg-primary/10 text-primary">
															<Shield className="w-5 h-5" />
														</div>
														<h3 className="text-base font-bold text-foreground">ATS Optimization Tips</h3>
													</div>
													{!(isPaid || isDeveloperMode) && (
														<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
															<Lock className="w-3 h-3" /> PREMIUM
														</span>
													)}
												</div>
												<p className="text-xs sm:text-sm text-foreground-secondary mb-4 leading-relaxed">
													Personalised, expert tips to pass Applicant Tracking Systems and reach human recruiters.
												</p>
												<div className={`space-y-2.5 mb-5 ${!(isPaid || isDeveloperMode) ? "opacity-60" : ""}`}>
													{(Array.isArray(feedback.resume?.ats_optimization_tips) ? feedback.resume.ats_optimization_tips : ["Optimize section headers for ATS parsing", "Format dates and locations consistently"]).map((tip, i) => (
														<div key={i} className="flex items-start gap-2 text-xs text-foreground">
															<Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
															<span className={!(isPaid || isDeveloperMode) ? "blur-xs leading-relaxed" : "leading-relaxed"}>{tip}</span>
														</div>
													))}
												</div>
											</div>
											{!(isPaid || isDeveloperMode) && (
												<button
													onClick={() => setShowPaymentModal(true)}
													className="w-full mt-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs transition shadow-xs cursor-pointer active:scale-98"
												>
													Unlock ATS Tips - £7.99
												</button>
											)}
										</div>
									</div>

									{/* Missing Keywords */}
									<div className={!(isPaid || isDeveloperMode) ? "pro-card-gradient pro-glow" : "rounded-2xl bg-card border border-border/80 card-elevation"}>
										<div className={`${!(isPaid || isDeveloperMode) ? "pro-card-inner" : ""} p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between h-full`}>
											<div>
												<div className="flex justify-between items-start mb-3">
													<div className="flex items-center gap-2">
														<div className="p-2 rounded-xl bg-primary/10 text-primary">
															<Search className="w-5 h-5" />
														</div>
														<h3 className="text-base font-bold text-foreground">Missing Skills & Keywords</h3>
													</div>
													{!(isPaid || isDeveloperMode) && (
														<span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
															<Lock className="w-3 h-3" /> PREMIUM
														</span>
													)}
												</div>
												<p className="text-xs sm:text-sm text-foreground-secondary mb-4 leading-relaxed">
													Discover {atsKeywords.missingKeywords.length || "several"} critical keywords missing from your CV that could cost you interviews.
												</p>
												<div className={`space-y-2.5 mb-5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar ${!(isPaid || isDeveloperMode) ? "opacity-60" : ""}`}>
													{(atsKeywords.missingKeywords.length > 0 ? ((isPaid || isDeveloperMode) ? atsKeywords.missingKeywords : atsKeywords.missingKeywords.slice(0, 4)) : ["Project Leadership & Delivery", "Data-Driven Decision Making"]).map((keyword, i) => (
														<div key={i} className="flex items-center gap-2 text-xs text-foreground">
															<div className="w-4 h-4 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold flex items-center justify-center flex-shrink-0">!</div>
															<span className={!(isPaid || isDeveloperMode) ? "blur-xs" : ""}>{keyword}</span>
														</div>
													))}
												</div>
											</div>
											{!(isPaid || isDeveloperMode) && (
												<button
													onClick={() => setShowPaymentModal(true)}
													className="w-full mt-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs transition shadow-xs cursor-pointer active:scale-98"
												>
													Unlock Keywords - £7.99
												</button>
											)}
										</div>
									</div>
								</motion.div>

								{/* Detailed Breakdown Sections */}
								<div className="space-y-6">
									{/* Overall Impression */}
									<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation">
										<div className="flex items-center gap-2.5 mb-3.5 text-foreground">
											<div className="p-2 rounded-xl bg-primary/10 text-primary">
												<FileText className="w-5 h-5" />
											</div>
											<h3 className="text-base font-bold">Overall Impression</h3>
										</div>
										<div className="p-4 rounded-xl bg-card-secondary border border-border">
											<p className="text-sm text-foreground leading-relaxed">
												{feedback.resume?.overall_impression || "No overall impression available for this résumé."}
											</p>
										</div>
									</motion.div>
									{/* 2-Column Detail Cards Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Contact Info Card */}
										<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation">
											<div className="flex items-center gap-2.5 mb-4 text-foreground">
												<div className="p-2 rounded-xl bg-primary/10 text-primary">
													<CircleUserRound className="w-5 h-5" />
												</div>
												<h3 className="text-base font-bold">Contact Information</h3>
											</div>
											<div className="space-y-4">
												{Array.isArray(feedback.resume?.contact_found) && feedback.resume.contact_found.length > 0 && (
													<div className="mb-4 space-y-2">
														<p className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Detected details</p>
														<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
															{feedback.resume.contact_found.map((contact, i) => {
																const parts = contact.split(': ');
																const label = parts[0];
																const value = parts[1];
																return (
																	<div key={i} className="bg-card-secondary p-3 rounded-xl border border-border flex items-center justify-between">
																		<span className="text-xs font-semibold text-foreground flex items-center gap-2">
																			<span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
																			{label}
																		</span>
																		<span className="text-xs text-foreground-secondary truncate max-w-[180px]">{value}</span>
																	</div>
																);
															})}
														</div>
													</div>
												)}

												<div className="space-y-2 mt-4">
													<p className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">
														Missing details
													</p>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
														{Array.isArray(feedback.resume?.contact_issues) && feedback.resume.contact_issues.length > 0 ? (
															feedback.resume.contact_issues.map((item, i) => (
																<div key={i} className="bg-card-secondary border border-border rounded-xl p-3 flex items-center justify-between text-xs">
																	<span className="font-semibold text-foreground flex items-center gap-2">
																		<span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
																		{item}
																	</span>
																	<span className="text-foreground-secondary text-[11px] bg-background/80 px-2 py-0.5 rounded-md border border-border/60">
																		Recommended for ATS
																	</span>
																</div>
															))
														) : (
															<p className="text-xs text-foreground-secondary italic">All contact info found.</p>
														)}
													</div>
												</div>
											</div>
										</motion.div>

										{/* Repetition Card */}
										<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation">
											<div className="flex items-center gap-2.5 mb-3.5 text-foreground">
												<div className="p-2 rounded-xl bg-primary/10 text-primary">
													<Repeat className="w-5 h-5" />
												</div>
												<h3 className="text-base font-bold">Vocabulary & Repetition</h3>
											</div>
											<div className="p-4 rounded-xl bg-card-secondary border border-border">
												{!repeatedWordsList || repeatedWordsList.length === 0 ? (
													<p className="text-xs text-foreground-secondary flex items-center gap-2">
														<Check className="w-4 h-4 text-emerald-500" />
														Vocabulary is well-varied. Good job!
													</p>
												) : (
													<div className="flex flex-wrap gap-2">
														{repeatedWordsList.map((word, i) => (
															<span key={i} className="px-2.5 py-1 rounded-lg bg-background border border-border/60 text-xs font-semibold text-foreground">
																{word}
															</span>
														))}
													</div>
												)}
											</div>
										</motion.div>

										{/* Essential Sections Card */}
										<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation">
											<div className="flex items-center gap-2.5 mb-4 text-foreground">
												<div className="p-2 rounded-xl bg-primary/10 text-primary">
													<Layers className="w-5 h-5" />
												</div>
												<h3 className="text-base font-bold">Essential Sections</h3>
											</div>
											<div className="p-4 rounded-xl bg-card-secondary border border-border space-y-3">
												<div className="flex items-center gap-2">
													{sections.hasMissing ? (
														<AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
													) : (
														<CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
													)}
													<p className="text-xs sm:text-sm font-semibold text-foreground">
														{sections.hasMissing
															? `${sections.missing.length} section${sections.missing.length > 1 ? 's' : ''} recommended to add`
															: 'All core sections successfully identified'}
													</p>
												</div>

												{sections.hasMissing && (
													<div className="flex flex-wrap gap-1.5 pt-1">
														{sections.missing.map(([section]) => (
															<span key={section} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-medium">
																+ {section}
															</span>
														))}
													</div>
												)}
											</div>
										</motion.div>

										{/* ATS Keywords Card */}
										<motion.div variants={itemVariants} className="rounded-2xl p-6 sm:p-7 bg-card border border-border/80 card-elevation">
											<div className="flex items-center gap-2.5 mb-4 text-foreground">
												<div className="p-2 rounded-xl bg-primary/10 text-primary">
													<Tags className="w-5 h-5" />
												</div>
												<h3 className="text-base font-bold">ATS Keywords Detected</h3>
											</div>
											<div className="p-4 rounded-xl bg-card-secondary border border-border space-y-3">
												<div className="flex items-center gap-2">
													<CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
													<p className="text-xs sm:text-sm font-semibold text-foreground">
														{atsKeywords.foundKeywords.length} industry keywords identified
													</p>
												</div>
												{atsKeywords.foundKeywords.length > 0 && (
													<div className="flex flex-wrap gap-1.5 pt-1">
														{atsKeywords.foundKeywords.slice(0, 10).map((kw, i) => (
															<span key={i} className="px-2.5 py-1 bg-card rounded-lg text-xs font-medium text-foreground border border-border">
																{kw}
															</span>
														))}
													</div>
												)}
											</div>
										</motion.div>
									</div>

									{/* Deep Dive Analytics */}
									<motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border/80 card-elevation overflow-hidden">
										<button 
											onClick={() => setShowDeepDive(!showDeepDive)}
											className="w-full flex items-center justify-between p-6 hover:bg-card-secondary transition-colors"
										>
											<div className="flex items-center gap-2.5 text-foreground">
												<div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
													<LineChart className="w-5 h-5" />
												</div>
												<div className="text-left">
													<h3 className="text-base font-bold">Deep Dive Analytics</h3>
													<p className="text-xs text-foreground-secondary">Inferred Role, Metrics Density, Readability & Verbs</p>
												</div>
											</div>
											<ChevronDown className={`w-5 h-5 text-foreground-secondary transition-transform duration-300 ${showDeepDive ? "rotate-180" : ""}`} />
										</button>
										
										<AnimatePresence>
											{showDeepDive && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.3 }}
													className="border-t border-border"
												>
													<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
														{/* Inferred Role */}
														<div className="space-y-2">
															<h4 className="text-sm font-bold text-foreground flex items-center gap-2">
																<Briefcase className="w-4 h-4 text-indigo-500" />
																Inferred Role Positioning
															</h4>
															<div className="p-4 bg-card-secondary rounded-xl border border-border">
																{feedback.resume?.inferred_role ? (
																	<div className="flex flex-col gap-1">
																		<span className="text-xs text-foreground-secondary">Your CV reads like a:</span>
																		<span className="font-semibold text-foreground">{feedback.resume.inferred_role}</span>
																	</div>
																) : (
																	<span className="text-xs text-foreground-secondary">Not enough data to infer role.</span>
																)}
															</div>
														</div>

														{/* Metrics Density */}
														<div className="space-y-2">
															<h4 className="text-sm font-bold text-foreground flex items-center gap-2">
																<Percent className="w-4 h-4 text-emerald-500" />
																Impact & Metrics Density
															</h4>
															<div className="p-4 bg-card-secondary rounded-xl border border-border">
																{feedback.resume?.metrics_audit ? (
																	<div className="flex items-center justify-between">
																		<div className="flex flex-col">
																			<span className="text-xs text-foreground-secondary">Bullets with metrics</span>
																			<span className="font-semibold text-emerald-500">{feedback.resume.metrics_audit.bullets_with_metrics || 0}</span>
																		</div>
																		<div className="flex flex-col text-right">
																			<span className="text-xs text-foreground-secondary">Bullets without metrics</span>
																			<span className="font-semibold text-amber-500">{feedback.resume.metrics_audit.bullets_without_metrics || 0}</span>
																		</div>
																	</div>
																) : (
																	<span className="text-xs text-foreground-secondary">Metrics audit unavailable.</span>
																)}
															</div>
														</div>

														{/* Readability */}
														<div className="space-y-2">
															<h4 className="text-sm font-bold text-foreground flex items-center gap-2">
																<BookOpen className="w-4 h-4 text-sky-500" />
																Readability
															</h4>
															<div className="p-4 bg-card-secondary rounded-xl border border-border">
																<p className="text-xs text-foreground leading-relaxed">
																	{feedback.resume?.readability || "Readability assessment unavailable."}
																</p>
															</div>
														</div>

														{/* Action Verbs */}
														<div className="space-y-2">
															<h4 className="text-sm font-bold text-foreground flex items-center gap-2">
																<Zap className="w-4 h-4 text-amber-500" />
																Action Verb Audit
															</h4>
															<div className="p-4 bg-card-secondary rounded-xl border border-border">
																{feedback.resume?.verb_audit && feedback.resume.verb_audit.length > 0 ? (
																	<ul className="space-y-2">
																		{feedback.resume.verb_audit.map((verb, i) => (
																			<li key={i} className="flex items-center justify-between text-xs">
																				<span className="text-destructive line-through">{verb.weak}</span>
																				<span className="text-foreground-secondary">→</span>
																				<span className="text-emerald-500 font-medium">{verb.strong_replacement}</span>
																			</li>
																		))}
																	</ul>
																) : (
																	<span className="text-xs text-foreground-secondary">No weak verbs identified. Good job!</span>
																)}
															</div>
														</div>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								</div>
							</>
						)}
					</motion.div>
				)}

				{currentView === "interview" && (
					<motion.div
						key="interview"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="flex flex-col w-full p-4 sm:p-6 md:px-8 lg:px-12 max-w-7xl mx-auto space-y-6 overflow-y-auto"
					>
						<Suspense fallback={<InterviewSkeleton />}>
							<InterviewPractice
								feedback={feedback?.interview}
								setFeedback={(updated) =>
									setFeedback((prev) => ({ ...prev, interview: updated }))
								}
							/>
						</Suspense>
					</motion.div>
				)}

				{currentView === "target" && (
					<motion.div
						key="target"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="w-full"
					>
						<Suspense fallback={<JDMatchSkeleton />}>
							<TargetMyCV
								feedback={feedback?.target}
								setFeedback={(updated) =>
									setFeedback((prev) => ({ ...prev, target: updated }))
								}
							/>
						</Suspense>
					</motion.div>
				)}

				{currentView === "pdf" && (
					<motion.div
						key="pdf"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="flex-1 w-full h-full flex flex-col overflow-hidden"
					>
						<Suspense fallback={<PDFViewerSkeleton />}>
							{fileUrl ? (
								<PDFViewer fileUrl={fileUrl} />
							) : (
								<div className="flex flex-col items-center justify-center h-full w-full text-foreground-secondary p-8 text-center space-y-3">
									<div className="w-16 h-16 rounded-2xl bg-card-secondary flex items-center justify-center text-foreground-secondary">
										<FileText className="w-8 h-8" />
									</div>
									<p className="text-base font-semibold text-foreground">No résumé uploaded yet.</p>
									<a href="/upload" className="text-xs sm:text-sm text-primary hover:underline font-medium">
										Upload a résumé to view it here
									</a>
								</div>
							)}
						</Suspense>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}

export default function Dashboard() {
	return (
		<Suspense fallback={<div className="p-6 max-w-7xl mx-auto"><DashboardSkeleton /></div>}>
			<DashboardContent />
		</Suspense>
	);
}