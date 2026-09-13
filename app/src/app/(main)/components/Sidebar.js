'use client';

import Link from "next/link";
import { useView } from "./ViewContext";
import { useFeedback } from "./FeedbackContext";
import { useDeveloperMode } from "./DeveloperModeContext";
import {
    MessagesSquare,
    Target,
    FileChartLine,
    Pin,
    Lock,
    Code2,
    ChevronDown,
    ChevronUp,
    MapPin,
    X,
    Lightbulb,
    Copy,
    Check,
    ArrowRight,
    Download
} from "lucide-react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { UsageTracker } from "@/components/UsageTracker";
import { ResumeHistory } from "@/components/ResumeHistory";
import { generateReport } from "./generateReport";

// Vocabulary set for fallback word break segmentation
const WORD_SET = new Set([
    "a", "about", "above", "across", "action", "activities", "addition", "after", "again", "against", "agile",
    "all", "almost", "along", "also", "always", "an", "analyst", "analytics", "analyze", "analyzed", "analyzing",
    "and", "api", "apis", "application", "applications", "approach", "architect", "architecture", "are", "area",
    "around", "as", "assessed", "assessing", "assessment", "assisted", "assisting", "assurance", "at", "audit",
    "audited", "audits", "automated", "automating", "automation", "back", "backend", "based", "be", "became",
    "because", "been", "before", "began", "behind", "being", "benefit", "benefits", "best", "better", "between",
    "both", "budget", "build", "building", "built", "business", "by", "calculated", "called", "can", "career",
    "case", "cases", "center", "ci", "cicd", "client", "clients", "cloud", "code", "coding", "collaborated",
    "collaborating", "collaboration", "collected", "collecting", "company", "completed", "completing", "compliance",
    "component", "components", "conducted", "conducting", "configuration", "configured", "consistent", "continuous",
    "control", "coordinate", "coordinated", "core", "cost", "coverage", "created", "creating", "creation",
    "cross", "customer", "customers", "daily", "dashboard", "dashboards", "data", "database", "databases",
    "date", "deadline", "debugged", "debugging", "decision", "decisions", "defect", "defects", "defined",
    "defining", "deliver", "delivered", "delivering", "delivery", "deployed", "deploying", "deployment",
    "design", "designed", "designing", "developed", "developer", "developing", "development", "devops",
    "digital", "directed", "direction", "document", "documentation", "documented", "documenting", "documents",
    "down", "driven", "due", "during", "each", "early", "education", "efficiency", "efficient", "effort",
    "efforts", "element", "elements", "employed", "end", "engineering", "engineer", "engineers", "enhanced",
    "enhancing", "ensure", "ensured", "ensuring", "enterprise", "environment", "environments", "error", "errors",
    "established", "establishing", "evaluate", "evaluated", "evaluating", "evaluation", "every", "example",
    "execute", "executed", "executing", "execution", "executive", "expand", "expanded", "experience", "experienced",
    "expert", "expertise", "external", "fast", "feature", "features", "feb", "february", "feedback", "field",
    "first", "flow", "flows", "for", "format", "forms", "found", "framework", "frameworks", "from", "front",
    "frontend", "full", "function", "functional", "functions", "future", "gain", "gained", "gap", "gaps",
    "general", "generate", "generated", "generating", "goal", "goals", "good", "great", "group", "groups",
    "growth", "guide", "guided", "guidelines", "handle", "handled", "handling", "hands", "have", "having",
    "header", "headings", "help", "helped", "helping", "high", "higher", "highlighted", "history", "hold",
    "held", "impact", "impacted", "impacting", "implement", "implemented", "implementing", "implementation",
    "improve", "improved", "improvement", "improving", "in", "include", "included", "includes", "including",
    "increase", "increased", "increasing", "industry", "infrastructure", "initiative", "initiatives", "innovation",
    "innovative", "input", "insight", "insights", "inspect", "inspected", "inspection", "install", "installed",
    "integration", "integrations", "internal", "interview", "interviews", "into", "investigate", "investigated",
    "issue", "issues", "it", "its", "java", "javascript", "jira", "job", "jobs", "join", "joined", "journey",
    "key", "knowledge", "known", "label", "landscape", "large", "larger", "lead", "leader", "leadership",
    "leading", "leads", "learned", "learning", "led", "level", "levels", "lifecycle", "line", "lines",
    "link", "linked", "list", "listed", "lists", "local", "location", "log", "logged", "logs", "maintain",
    "maintained", "maintaining", "maintenance", "major", "manage", "managed", "management", "manager",
    "managers", "managing", "manual", "manually", "market", "marketing", "master", "match", "matched",
    "matches", "matching", "matrix", "matter", "matters", "maximum", "measure", "measured", "measures",
    "measuring", "meet", "meeting", "meetings", "member", "members", "met", "method", "methodologies",
    "methodology", "methods", "metric", "metrics", "microservices", "mid", "middle", "migration", "milestone",
    "milestones", "minimum", "missing", "mobile", "model", "models", "modern", "monitor", "monitored",
    "monitoring", "month", "monthly", "months", "more", "most", "multiple", "must", "name", "native",
    "need", "needed", "needs", "network", "networks", "new", "next", "node", "nodejs", "note", "noted",
    "notes", "number", "numbers", "objective", "objectives", "obtain", "obtained", "of", "off", "offer",
    "office", "on", "one", "online", "only", "open", "operate", "operated", "operating", "operation",
    "operations", "opportunity", "optimization", "optimize", "optimized", "optimizing", "or", "order",
    "organization", "organized", "organizing", "original", "other", "others", "our", "out", "outcome",
    "outcomes", "output", "overall", "oversee", "overseeing", "oversaw", "page", "pages", "part", "participate",
    "participated", "participating", "partner", "partners", "path", "pattern", "patterns", "per", "percent",
    "percentage", "performance", "period", "pipeline", "pipelines", "plan", "planned", "planning", "plans",
    "platform", "platforms", "plus", "point", "points", "policy", "portfolio", "position", "positions",
    "post", "power", "practice", "practices", "present", "presented", "prevent", "prevented", "preventing",
    "prevention", "price", "primary", "prior", "priorities", "priority", "problem", "problems", "procedure",
    "procedures", "process", "processes", "processing", "produce", "produced", "producing", "product",
    "production", "products", "program", "programs", "project", "projects", "promote", "promoted", "proposal",
    "protocols", "provide", "provided", "providing", "qa", "qualification", "qualifications", "quality",
    "quantifiable", "quantify", "query", "quick", "quickly", "rate", "rates", "reach", "reached", "react",
    "readability", "recommend", "recommendation", "recommendations", "recommended", "record", "recorded",
    "records", "recruiter", "recruiters", "reduce", "reduced", "reducing", "reduction", "reductions",
    "regression", "regular", "regularly", "release", "released", "releases", "releasing", "relevant",
    "reliability", "reliable", "report", "reported", "reporting", "reports", "require", "required",
    "requirement", "requirements", "research", "researched", "resolution", "resolve", "resolved", "resolving",
    "resource", "resources", "response", "responsibilities", "responsibility", "responsible", "result",
    "resulted", "resulting", "results", "resume", "review", "reviewed", "reviewing", "reviews", "revise",
    "revised", "revision", "risk", "risks", "roadmap", "robust", "role", "roles", "root", "rule", "rules",
    "run", "running", "runs", "safe", "safety", "sales", "same", "sample", "scale", "scaled", "scaling",
    "scenario", "scenarios", "schedule", "scheduled", "schedules", "scope", "score", "scores", "scoring",
    "script", "scripting", "scripts", "scrum", "seamless", "search", "searched", "section", "sections",
    "secure", "secured", "security", "segment", "selected", "senior", "serve", "served", "server", "servers",
    "service", "services", "session", "set", "setup", "several", "share", "shared", "shift", "short",
    "show", "showed", "showing", "shown", "side", "significant", "significantly", "simple", "simulated",
    "simulation", "single", "site", "sites", "size", "skill", "skilled", "skills", "small", "smaller",
    "smooth", "software", "solution", "solutions", "solve", "solved", "source", "space", "spacing",
    "specialist", "specific", "specifications", "speed", "sprint", "sprints", "sql", "stability", "stable",
    "stack", "staff", "stage", "stages", "stakeholder", "stakeholders", "standard", "standardize",
    "standardized", "standards", "start", "started", "starting", "state", "status", "step", "steps",
    "storage", "store", "stored", "strategic", "strategy", "streamline", "streamlined", "streamlining",
    "strength", "strengths", "strong", "stronger", "structure", "structured", "structures", "study",
    "success", "successful", "successfully", "suggest", "suggested", "suggestion", "suggestions", "suite",
    "suites", "summary", "support", "supported", "supporting", "system", "systematic", "systems", "table",
    "tables", "tackle", "tackled", "target", "targeted", "task", "tasks", "team", "teams", "tech",
    "technical", "technologies", "technology", "template", "templates", "test", "tested", "tester",
    "testers", "testing", "tests", "text", "than", "that", "the", "their", "them", "then", "there",
    "these", "they", "this", "thorough", "thoroughly", "threat", "threats", "three", "through", "throughout",
    "time", "timelines", "times", "to", "tool", "tools", "top", "total", "track", "tracked", "tracking",
    "trade", "trained", "training", "transfer", "transform", "transformed", "transition", "trend", "trends",
    "triage", "troubleshoot", "troubleshooting", "turnaround", "two", "type", "types", "ui", "under",
    "understand", "understanding", "unit", "united", "units", "up", "update", "updated", "updates",
    "updating", "upgrade", "upgrades", "upon", "us", "usage", "use", "used", "user", "users", "using",
    "validate", "validated", "validating", "validation", "value", "variable", "variance", "variant",
    "various", "vendor", "vendors", "verify", "verifying", "version", "versions", "via", "view", "visibility",
    "visual", "volume", "vulnerability", "web", "website", "websites", "weekly", "well", "were", "what",
    "when", "where", "which", "while", "white", "who", "whole", "will", "win", "wins", "with", "within",
    "without", "word", "words", "work", "worked", "worker", "workflow", "workflows", "working", "works",
    "world", "year", "years", "yield", "yielded"
]);

function segmentToken(token) {
    if (!token || token.length < 8 || token.includes("http") || token.includes("@")) {
        return token;
    }

    const n = token.length;
    const lower = token.toLowerCase();
    const dp = new Array(n + 1).fill(null);
    dp[0] = [];

    for (let i = 0; i < n; i++) {
        if (dp[i] === null) continue;

        for (let j = i + 1; j <= n; j++) {
            const word = lower.substring(i, j);
            if (WORD_SET.has(word)) {
                if (dp[j] === null || dp[j].length > dp[i].length + 1) {
                    dp[j] = [...dp[i], token.substring(i, j)];
                }
            }
        }
    }

    if (dp[n] && dp[n].length > 1) {
        return dp[n].join(" ");
    }

    return token;
}

function formatCvExcerpt(rawText) {
    if (!rawText || typeof rawText !== 'string') return "";
    let text = rawText.trim();

    text = text
        .replace(/([a-zA-Z0-9])([,:;])([a-zA-Z0-9])/g, "$1$2 $3")
        .replace(/([a-z])\.([A-Z])/g, "$1. $2")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([a-zA-Z])([0-9]{4})/g, "$1 $2")
        .replace(/([0-9]{4})([a-zA-Z])/g, "$1 $2")
        .replace(/([a-zA-Z0-9])([–—-])([a-zA-Z0-9])/g, "$1 $2 $3");

    const rawTokens = text.split(/\s+/);
    const formatted = rawTokens.map(token => {
        const punctMatch = token.match(/([.,;:!?]+)$/);
        const punct = punctMatch ? punctMatch[1] : "";
        const cleanWord = punct ? token.slice(0, -punct.length) : token;
        const segmented = segmentToken(cleanWord);
        return segmented + punct;
    });

    return formatted.join(" ").replace(/\s{2,}/g, " ").trim();
}

// Matches an AI-compressed/normalized excerpt back to the raw, denormalized CV text
function matchOriginalCvText(excerpt, rawCvText) {
    if (!excerpt || typeof excerpt !== 'string') return "";
    const cleanExcerpt = excerpt.trim();
    if (!cleanExcerpt) return "";

    if (!rawCvText || typeof rawCvText !== 'string' || rawCvText.length < 10) {
        return formatCvExcerpt(cleanExcerpt);
    }

    const normalize = (s) => (s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const targetNorm = normalize(cleanExcerpt);

    if (!targetNorm || targetNorm.length < 8) {
        return formatCvExcerpt(cleanExcerpt);
    }

    // 1. Line-by-line / bullet check in raw CV text
    const lines = rawCvText.split(/\r?\n|•|\t/);
    for (const line of lines) {
        const lineClean = line.trim();
        if (!lineClean || lineClean.length < 6) continue;
        const lineNorm = normalize(lineClean);

        if (lineNorm === targetNorm || lineNorm.includes(targetNorm) || targetNorm.includes(lineNorm)) {
            return lineClean.replace(/^[-•*]\s*/, '').trim();
        }
    }

    // 2. Sliding window character search across raw CV text to extract original spacing
    let normBuffer = "";
    const indexMap = [];

    for (let i = 0; i < rawCvText.length; i++) {
        const ch = rawCvText[i];
        if (/[a-zA-Z0-9]/.test(ch)) {
            normBuffer += ch.toLowerCase();
            indexMap.push(i);
        }
    }

    const matchIdx = normBuffer.indexOf(targetNorm);
    if (matchIdx !== -1) {
        const startRaw = indexMap[matchIdx];
        const endRaw = indexMap[matchIdx + targetNorm.length - 1] + 1;
        const matchedSubstring = rawCvText.substring(startRaw, endRaw).trim();
        if (matchedSubstring) {
            return matchedSubstring.replace(/^[-•*]\s*/, '').trim();
        }
    }

    // 3. Fallback to dictionary word-break segmentation
    return formatCvExcerpt(cleanExcerpt);
}

// Clean and standardize fix titles to professional names
function sanitizeFixLabel(rawLabel, type) {
    if (!rawLabel || typeof rawLabel !== 'string') return "Suggested Improvement";

    const lower = rawLabel.toLowerCase();

    if (lower.includes('quantif') || lower.includes('metric') || lower.includes('lacks') || lower.includes('number') || lower.includes('percentage') || lower.includes('statistic')) {
        return "Quantify Impact with Metrics";
    }
    if (lower.includes('verb') || lower.includes('action') || lower.includes('passive')) {
        return "Strengthen Action Verbs";
    }
    if (lower.includes('keyword') || lower.includes('ats') || lower.includes('skill')) {
        return "ATS Keyword Optimization";
    }
    if (lower.includes('bullet') || lower.includes('point')) {
        return "Bullet Point Clarity";
    }
    if (lower.includes('header') || lower.includes('heading') || lower.includes('section')) {
        return "Clear Section Organization";
    }
    if (lower.includes('length') || lower.includes('concise') || lower.includes('page')) {
        return "Résumé Length & Conciseness";
    }
    if (lower.includes('spacing') || lower.includes('margin') || lower.includes('align') || lower.includes('format')) {
        return "Formatting & Alignment";
    }

    let text = rawLabel.trim().replace(/([a-z])([A-Z])/g, '$1 $2');
    text = text.replace(/\s*,\s*/g, ', ').replace(/\s{2,}/g, ' ');

    if (text.length > 32) {
        return "Improve Impact & Clarity";
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Concise 1-sentence takeaway insight per situation
function getConciseInsight(fix) {
    const label = (fix.label || '').toLowerCase();
    const type = (fix.type || '').toLowerCase();

    if (label.includes('metric') || label.includes('quantif') || type === 'impact') {
        return "Using statistics or measurable metrics gives your bullet instant credibility and proves real-world results.";
    }
    if (label.includes('verb') || label.includes('action')) {
        return "Starting with powerful action verbs shows ownership and leadership rather than passive duties.";
    }
    if (label.includes('ats') || label.includes('keyword') || type === 'ats') {
        return "Including standard industry terminology helps your CV pass automated ATS candidate screening.";
    }
    if (label.includes('bullet') || label.includes('clarity') || label.includes('concise')) {
        return "Concise 1–2 line bullets in an 'Action + Result' format make your top wins effortless to skim.";
    }
    if (label.includes('section') || label.includes('format') || label.includes('header')) {
        return "Standard section headers ensure ATS scanners extract your job titles and dates correctly.";
    }

    return "Polishing this point improves clarity and increases your interview callback rate.";
}

// Animated Score Circle Component
function AnimatedScoreCircle({ score }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    const progress = useMotionValue(circumference);

    useEffect(() => {
        const counterAnimation = animate(count, score, {
            duration: 1.8,
            ease: "easeOut"
        });

        const circleAnimation = animate(
            progress,
            circumference * (1 - score / 100),
            {
                duration: 1.8,
                ease: "easeOut"
            }
        );

        return () => {
            counterAnimation.stop();
            circleAnimation.stop();
        };
    }, [score, count, progress, circumference]);

    return (
        <div className="flex justify-center items-center w-full my-2">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-border"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset: progress }}
                    />
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e67b77" />
                            <stop offset="100%" stopColor="#ff9068" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span className="text-4xl font-extrabold text-foreground tracking-tight">
                        {rounded}
                    </motion.span>
                    <span className="text-[11px] uppercase tracking-wider text-foreground-secondary font-semibold">Overall</span>
                </div>
            </div>
        </div>
    );
}

// Collapsible component
function Collapsible({ isOpen, children }) {
    const wrapperRef = useRef(null);
    const innerRef = useRef(null);

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        const inner = innerRef.current;
        if (!wrapper || !inner) return;

        wrapper.style.display = 'block';
        const measured = inner.scrollHeight;

        if (isOpen) {
            wrapper.style.overflow = 'hidden';
            wrapper.style.maxHeight = '0px';
            wrapper.style.opacity = '0';
            inner.style.transformOrigin = 'top center';
            inner.style.transform = 'scaleY(0)';
            inner.style.opacity = '0';

            requestAnimationFrame(() => {
                inner.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 180ms ease';
                inner.style.transform = 'scaleY(1)';
                inner.style.opacity = '1';

                wrapper.style.transition = 'max-height 320ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
                wrapper.style.maxHeight = `${measured}px`;
                wrapper.style.opacity = '1';
            });

            const onEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    wrapper.style.maxHeight = 'none';
                    wrapper.style.overflow = '';
                    wrapper.removeEventListener('transitionend', onEnd);
                }
            };
            wrapper.addEventListener('transitionend', onEnd);
        } else {
            wrapper.style.overflow = 'hidden';
            wrapper.style.maxHeight = `${measured}px`;
            inner.style.transformOrigin = 'top center';
            inner.style.transform = 'scaleY(1)';
            inner.style.opacity = '1';

            requestAnimationFrame(() => {
                inner.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1), opacity 140ms ease';
                inner.style.transform = 'scaleY(0)';
                inner.style.opacity = '0';

                wrapper.style.transition = 'max-height 300ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
                wrapper.style.maxHeight = '0px';
                wrapper.style.opacity = '0';
            });

            const onEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    wrapper.style.display = 'none';
                    wrapper.removeEventListener('transitionend', onEnd);
                }
            };
            wrapper.addEventListener('transitionend', onEnd);
        }

        return () => {
            if (!wrapper || !inner) return;
            wrapper.style.transition = '';
            inner.style.transition = '';
        };
    }, [isOpen]);

    return (
        <div ref={wrapperRef} style={{ overflow: 'hidden', display: isOpen ? 'block' : 'none', willChange: 'max-height, opacity' }}>
            <div ref={innerRef} style={{ transformOrigin: 'top center', transform: isOpen ? 'scaleY(1)' : 'scaleY(0)', opacity: isOpen ? 1 : 0 }}>
                {children}
            </div>
        </div>
    );
}

function SidebarContent({ isMobile = false }) {
    const { currentView, setCurrentView, closeMobileMenu } = useView();
    const { feedback } = useFeedback();
    const { data: session } = useSession();
    const { isDeveloperMode, toggleDeveloperMode, isAuthorized } = useDeveloperMode();
    const [selectedFix, setSelectedFix] = useState(null);
    const [copied, setCopied] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname && pathname !== "/") {
            localStorage.setItem("lastVisitedPage", pathname);
        }
    }, [pathname]);

    const resumeData = feedback?.resume || feedback || {};
    const rawCvText = typeof window !== 'undefined' ? (localStorage.getItem("rawParsedText") || localStorage.getItem("parsedText") || "") : "";

    const getTopFixes = () => {
        if (!resumeData) return { topFixes: [], lockedPreview: [], hiddenLocked: [], goodEnough: [] };

        const fixes = [];
        const seenLabels = new Set();

        const addFix = (rawLabel, severity, location, example, detail, type, howToFix) => {
            const cleanLabel = sanitizeFixLabel(rawLabel, type);
            if (!cleanLabel) return;

            const key = cleanLabel.toLowerCase() + (location || '');
            if (!seenLabels.has(key)) {
                seenLabels.add(key);
                fixes.push({
                    label: cleanLabel,
                    severity: severity || 5,
                    location: matchOriginalCvText(String(location || ''), rawCvText),
                    example: matchOriginalCvText(String(example || ''), rawCvText),
                    detail: String(detail || ''),
                    type: type || 'improvement',
                    howToFix: String(howToFix || '')
                });
            }
        };

        if (resumeData.improvements) {
            resumeData.improvements.forEach(improvement => {
                if (typeof improvement === 'object' && improvement.issue) {
                    addFix(
                        improvement.issue,
                        improvement.severity || 5,
                        improvement.location,
                        improvement.example,
                        improvement.explanation,
                        'improvement',
                        improvement.fix
                    );
                } else if (typeof improvement === 'string') {
                    addFix(
                        improvement,
                        5,
                        '',
                        '',
                        improvement,
                        'improvement',
                        improvement
                    );
                }
            });
        }

        if (resumeData.ats_tips) {
            resumeData.ats_tips.forEach(tip => {
                if (typeof tip === 'object' && tip.issue) {
                    addFix(
                        tip.issue,
                        tip.severity || 6,
                        tip.location,
                        tip.example,
                        tip.explanation,
                        'ats',
                        tip.fix
                    );
                } else if (typeof tip === 'string') {
                    addFix(
                        tip,
                        6,
                        '',
                        '',
                        tip,
                        'ats',
                        tip
                    );
                }
            });
        }

        if (resumeData.formatting_issues) {
            resumeData.formatting_issues.forEach(issue => {
                if (typeof issue === 'object' && issue.issue) {
                    addFix(
                        issue.issue,
                        issue.severity || 5,
                        issue.location,
                        issue.example,
                        issue.explanation,
                        'formatting',
                        issue.fix
                    );
                } else if (typeof issue === 'string') {
                    addFix(
                        issue,
                        5,
                        '',
                        '',
                        issue,
                        'formatting',
                        issue
                    );
                }
            });
        }

        if (resumeData.impact_opportunities) {
            resumeData.impact_opportunities.forEach(impact => {
                if (typeof impact === 'object') {
                    addFix(
                        impact.issue || "Quantify Impact with Metrics",
                        impact.severity || 7,
                        impact.location,
                        impact.example,
                        impact.explanation || impact.fix || '',
                        'impact',
                        impact.fix
                    );
                }
            });
        }

        fixes.sort((a, b) => b.severity - a.severity);

        const goodEnough = fixes.filter(f => f.severity >= 7);
        const needsFixing = fixes.filter(f => f.severity < 7);

        const topFixes = needsFixing.slice(0, 3);
        const lockedPreview = needsFixing.slice(3, 5);
        const hiddenLocked = needsFixing.slice(5);

        return { topFixes, lockedPreview, hiddenLocked, goodEnough };
    };

    const { topFixes, lockedPreview, goodEnough } = getTopFixes();
    const [showAllGoodEnough, setShowAllGoodEnough] = useState(false);
    const [showAllTopFixes, setShowAllTopFixes] = useState(false);
    const [topFixesExpanded, setTopFixesExpanded] = useState(true);
    const [goodEnoughExpanded, setGoodEnoughExpanded] = useState(true);
    const isPaid = resumeData?.isPaid || false;
    const canExpandTopFixes = isPaid || isDeveloperMode;

    const navItems = [
        { id: "resume", label: "Score My CV", icon: FileChartLine },
        { id: "interview", label: "Interview Practice", icon: MessagesSquare },
        { id: "target", label: "Target My CV", icon: Target },
    ];

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Top Logo & Title Header - Locked to exact 64px height with clean inset gaps */}
            <div className="h-16 min-h-[64px] max-h-[64px] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 relative">
                <Link
                    href="/dashboard"
                    onClick={() => setCurrentView("resume")}
                    className="flex items-center gap-2.5 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e67b77] to-[#ff9068] flex items-center justify-center shadow-sm">
                        <Pin className="w-4 h-4 text-white transform -rotate-45" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        PinPoint
                    </span>
                </Link>

                {isMobile && (
                    <button
                        onClick={closeMobileMenu}
                        className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Clean Inset Divider with spacing before meeting the vertical borders */}
                <div className="absolute bottom-0 inset-x-4 border-b border-border/80 pointer-events-none" />
            </div>

            {/* Scrollable Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Usage Tracker */}
                {!isDeveloperMode && <UsageTracker />}

                {session?.user && !isDeveloperMode && <div className="border-b border-border my-2" />}

                {/* Dynamic Score Circle */}
                {resumeData?.score && (
                    <AnimatedScoreCircle score={resumeData.score} />
                )}

            <div className="border-b border-border my-2" />

            {/* Tools Section */}
            <div className="flex flex-col space-y-1 px-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary mb-2 px-2">
                    Tools
                </p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                                if (isMobile) closeMobileMenu();
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                                    : "text-foreground-secondary hover:text-foreground hover:bg-card-secondary"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-foreground-secondary"}`} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
                {(isPaid || isDeveloperMode) && resumeData?.score && (
                    <button
                        onClick={() => generateReport(resumeData)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-primary hover:bg-card-secondary hover:text-primary-hover"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download Report</span>
                    </button>
                )}
            </div>

            {/* Top Fixes Section */}
            {(topFixes.length > 0 || lockedPreview.length > 0) && (
                <>
                    <div className="border-b border-border my-2" />
                    <div className="space-y-2 px-1">
                        <button
                            onClick={() => setTopFixesExpanded(!topFixesExpanded)}
                            className="flex items-center justify-between w-full text-[11px] font-bold text-foreground-secondary uppercase tracking-wider px-2 py-1 hover:text-primary transition-colors group"
                        >
                            <span>Top Fixes</span>
                            {topFixesExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>

                        <Collapsible isOpen={topFixesExpanded}>
                            <div className="space-y-1 pt-1">
                                {(showAllTopFixes ? topFixes : topFixes.slice(0, 4)).map((fix, index) => (
                                    <button
                                        key={`top-${index}`}
                                        onClick={() => setSelectedFix(fix)}
                                        className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-card-secondary transition-colors cursor-pointer group text-left"
                                        title={fix.label}
                                    >
                                        <span className="text-xs text-foreground-secondary truncate flex-1 mr-2 group-hover:text-foreground transition-colors">
                                            {fix.label}
                                        </span>
                                        <span className="text-primary text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10">
                                            {fix.severity}
                                        </span>
                                    </button>
                                ))}

                                {!showAllTopFixes && topFixes.length > 4 && (
                                    <button
                                        onClick={() => canExpandTopFixes ? setShowAllTopFixes(true) : null}
                                        className={`w-full mt-1 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                                            canExpandTopFixes
                                                ? 'text-primary hover:bg-card-secondary'
                                                : 'text-muted-foreground cursor-not-allowed'
                                        }`}
                                        disabled={!canExpandTopFixes}
                                    >
                                        <span>Show {topFixes.length - 4} More</span>
                                        {!canExpandTopFixes && <Lock className="w-3 h-3" />}
                                    </button>
                                )}

                                {showAllTopFixes && topFixes.length > 4 && (
                                    <button
                                        onClick={() => setShowAllTopFixes(false)}
                                        className="w-full mt-1 py-1.5 text-xs text-primary hover:bg-card-secondary rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <span>Show Less</span>
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </Collapsible>
                    </div>
                </>
            )}

            {/* Good Enough Section */}
            {goodEnough.length > 0 && (
                <>
                    <div className="border-b border-border my-2" />
                    <div className="space-y-2 px-1">
                        <button
                            onClick={() => setGoodEnoughExpanded(!goodEnoughExpanded)}
                            className="flex items-center justify-between w-full text-[11px] font-bold text-foreground-secondary uppercase tracking-wider px-2 py-1 hover:text-primary transition-colors group"
                        >
                            <span>Good Enough</span>
                            {goodEnoughExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>

                        <Collapsible isOpen={goodEnoughExpanded}>
                            <div className="space-y-1 pt-1">
                                {(showAllGoodEnough ? goodEnough : goodEnough.slice(0, 3)).map((fix, index) => (
                                    <button
                                        key={`good-${index}`}
                                        onClick={() => setSelectedFix(fix)}
                                        className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-card-secondary transition-colors cursor-pointer group text-left"
                                        title={fix.label}
                                    >
                                        <span className="text-xs text-foreground-secondary truncate flex-1 mr-2 group-hover:text-foreground transition-colors">
                                            {fix.label}
                                        </span>
                                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                                            {fix.severity}
                                        </span>
                                    </button>
                                ))}

                                {goodEnough.length > 3 && (
                                    <button
                                        onClick={() => canExpandTopFixes ? setShowAllGoodEnough(!showAllGoodEnough) : null}
                                        className={`w-full mt-1 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                                            canExpandTopFixes
                                                ? 'text-primary hover:bg-card-secondary'
                                                : 'text-muted-foreground cursor-not-allowed'
                                        }`}
                                        disabled={!canExpandTopFixes}
                                    >
                                        {showAllGoodEnough ? (
                                            <>
                                                <span>Show Less</span>
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Show {goodEnough.length - 3} More</span>
                                                {!canExpandTopFixes && <Lock className="w-3 h-3" />}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </Collapsible>
                    </div>
                </>
            )}

            {/* Resume History */}
            <div className="border-b border-border my-2" />
            <div className="px-1">
                <ResumeHistory />
            </div>

            {/* Developer Mode Toggle */}
            {isAuthorized && (
                <>
                    <div className="border-b border-border my-2" />
                    <div className="px-1 pb-2">
                        <button
                            onClick={toggleDeveloperMode}
                            className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                                isDeveloperMode
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                                    : 'bg-card-secondary text-foreground hover:bg-card-secondary/80 border border-border'
                            }`}
                        >
                            <Code2 className="w-3.5 h-3.5" />
                            {isDeveloperMode ? 'DEV MODE ON' : 'DEV MODE OFF'}
                        </button>
                        {isDeveloperMode && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center mt-1.5">
                                ✓ Premium unlocked
                            </p>
                        )}
                    </div>
                </>
            )}


            {/* Intuitive, Streamlined Fix Detail Modal */}
            <AnimatePresence>
                {selectedFix && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4"
                        onClick={() => setSelectedFix(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="glass-panel rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-4 text-left"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header: Title + Context Badges + Close */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                                        {selectedFix.label}
                                    </h3>
                                    <div className="flex items-center flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-0.5 rounded-md font-bold bg-primary/10 text-primary">
                                            Priority {selectedFix.severity}/10
                                        </span>
                                        {selectedFix.location && (
                                            <span className="text-foreground-secondary flex items-center gap-1 truncate max-w-[240px]">
                                                <MapPin className="w-3 h-3 text-foreground-secondary flex-shrink-0" />
                                                <span className="truncate">{selectedFix.location}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFix(null)}
                                    className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition flex-shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Before & After Comparison */}
                            <div className="space-y-2.5">
                                {/* Current on CV */}
                                {selectedFix.example && (
                                    <div className="p-3.5 rounded-xl bg-card-secondary border border-border space-y-1">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Current on your CV
                                        </p>
                                        <p className="text-xs text-foreground leading-relaxed">
                                            &ldquo;{selectedFix.example}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Suggested Rewrite */}
                                {selectedFix.howToFix && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 relative group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                                Suggested Rewrite
                                            </p>
                                            <button
                                                onClick={() => handleCopy(selectedFix.howToFix)}
                                                className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-semibold flex items-center gap-1 transition cursor-pointer"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                        <span>Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-100 leading-relaxed">
                                            {selectedFix.howToFix}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 1-Sentence Quick Takeaway */}
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-card-secondary border border-border/80 text-xs text-foreground-secondary leading-relaxed">
                                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{getConciseInsight(selectedFix)}</span>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => setSelectedFix(null)}
                                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const { isMobileMenuOpen, closeMobileMenu } = useView();

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside className="hidden md:flex flex-col w-72 lg:w-76 border-r border-border bg-sidebar-bg text-foreground shadow-xs h-screen flex-shrink-0 transition-colors">
                <SidebarContent isMobile={false} />
            </aside>

            {/* Mobile Animated Slide-in Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMobileMenu}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 26, stiffness: 220 }}
                            className="fixed inset-y-0 left-0 z-50 w-76 max-w-[85vw] bg-sidebar-bg border-r border-border shadow-2xl flex flex-col md:hidden"
                        >
                            <SidebarContent isMobile={true} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}