"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "../../(main)/components/FileUpload";
import LoadingPage from "../../(main)/components/LoadingPage";
import { Lock, Target, BarChart3, Lightbulb, CheckCircle, Sparkles } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import Footer from "@/components/Footer";
import ThemeSwitch from "../../(main)/components/ThemeSwitch";

export default function Upload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileUrl, setFileUrl] = useState(null);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const router = useRouter();

    async function handleUploadAndAnalyse(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const text = await handleUploadFile(e);
        if (!text) {
            setLoading(false);
            return;
        }

        const success = await handleAnalyse(text);
        if (!success) {
            // handleAnalyse already set loading=false and error state
            return;
        }

        setShowSuccess(true);
        setTimeout(() => {
            router.push("/dashboard");
        }, 800);
    }

    const handleUploadFile = async (e) => {
        if (e) e.preventDefault();
        if (!file) {
            console.log("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("uploaded_file", file);

        try {
            setLoading(true);
            console.log("Sending file to backend:", file.name);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Uploaded", data);

            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
            setFileUrl(URL.createObjectURL(file));

            if (data?.rawText) {
                localStorage.setItem("rawParsedText", data.rawText);
            }

            return data.text;
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyse = async (text) => {
        if (!text) {
            console.log("No parsed text to analyze yet");
            return false;
        }

        try {
            setLoading(true);
            console.log("Sending résumé text to OpenAI for analysis...");

            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            const base64String = await base64Promise;

            const aiModel = localStorage.getItem("aiModel") || "gpt-4o-mini";

            const response = await fetch("/api/analyse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    fileName: file.name,
                    fileData: base64String,
                    model: aiModel
                }),
            });

            if (!response.ok) {
                let errorData;
                let rawText = "";
                try {
                    rawText = await response.text();
                    errorData = JSON.parse(rawText);
                } catch (parseErr) {
                    console.error("Failed to parse error response:", parseErr, rawText);
                    setError(`Analysis failed: Server returned ${response.status} ${response.statusText}. Response: ${rawText.substring(0, 100)}`);
                    setLoading(false);
                    return false;
                }

                console.error(`Analysis failed (${response.status}):`, errorData);

                if (errorData && errorData.limitReached) {
                    setError(`⚠️ ${errorData.error}`);
                } else if (errorData && errorData.error) {
                    setError(`${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`);
                } else {
                    setError(`Analysis failed: HTTP ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
                }
                setLoading(false);
                return false;
            }

            const data = await response.json();
            console.log("AI feedback received:", data);

            if (data.usageInfo) {
                console.log(`Usage: ${data.usageInfo.used}/${data.usageInfo.limit} (${data.usageInfo.remaining} remaining)`);
            }

            localStorage.setItem("fileUrl", base64String);
            localStorage.setItem("parsedText", text);
            const feedbackObj = { resume: data };
            localStorage.setItem("feedback", JSON.stringify(feedbackObj));

            if (data.id) {
                localStorage.setItem("currentResumeId", data.id);
            }

            return true;
        } catch (err) {
            console.error("Analysis failed:", err);
            setError(`Analysis failed: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Success Animation Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                duration: 0.6
                            }}
                            className="bg-card rounded-full p-8 shadow-2xl"
                        >
                            <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={2.5} />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <LoadingPage />
            ) : (
                <div className="flex-1 py-12">
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Header with AI Model Badge and Auth Button */}
                        <div className="flex justify-between items-center mb-6">
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </motion.div>
                                    <span className="text-sm font-medium text-foreground">Powered by the latest GPT model</span>
                                </span>
                            </motion.div>
                            <div className="flex items-center gap-4">
                                <ThemeSwitch />
                                <AuthButton />
                            </div>
                        </div>

                        <div className="bg-card shadow-md rounded-xl p-12 mb-12 border border-border">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                                <div className="flex flex-col items-start text-left flex-1">
                                    <h1 className="text-4xl font-bold leading-tight mb-2 text-foreground">
                                        Analyze Your Resume
                                    </h1>
                                    <h2 className="text-4xl font-bold leading-tight mb-4 text-foreground">
                                        with <span className="text-primary">AI-Powered Insights</span>
                                    </h2>
                                    <p className="text-muted-foreground text-lg">Optimize your resume, get ATS-ready, and land your dream job faster.</p>
                                </div>
                                <form
                                    encType="multipart/form-data"
                                    className="flex flex-col items-center w-full md:w-96"
                                >
                                    <FileUpload onFileChange={setFile} />

                                    {file && (
                                        <p className="text-sm text-muted-foreground mt-4">
                                            Selected file: <span className="font-semibold text-foreground">{file.name}</span>
                                        </p>
                                    )}
                                    {error && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg w-full">
                                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleUploadAndAnalyse}
                                        disabled={loading || !file}
                                        className="bg-primary hover:bg-[#d66b68] text-white font-semibold mt-4 py-3 px-6 rounded-xl shadow-md transition w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? "Analyzing..." : file ? "Analyze Resume" : "Upload a file first"}
                                    </button>
                                    <p className="flex text-xs items-center justify-center mt-3 text-muted-foreground">
                                        <Lock className="mr-1 w-3 h-3" /> Privacy Guaranteed
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="mb-12">
                            <motion.h2
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="text-3xl font-bold text-center mb-8 text-foreground"
                            >
                                How It Works
                            </motion.h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                                    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                                    className="bg-card shadow-md rounded-xl p-6 border-2 border-primary/20 hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer"
                                >
                                    <motion.div
                                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        1
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Upload Your CV</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Simply drag and drop your resume or click to browse. Supports PDF and TXT formats.
                                    </p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                                    className="bg-card shadow-md rounded-xl p-6 border-2 border-primary/20 hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer"
                                >
                                    <motion.div
                                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        2
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Analysis</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Our AI instantly analyzes your resume for ATS compatibility, keywords, and formatting.
                                    </p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                                    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                                    className="bg-card shadow-md rounded-xl p-6 border-2 border-primary/20 hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer"
                                >
                                    <motion.div
                                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        3
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Get Insights</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Receive a detailed score (0-100) with prioritized fixes ranked by severity.
                                    </p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                                    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                                    className="bg-card shadow-md rounded-xl p-6 border-2 border-primary/20 hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer"
                                >
                                    <motion.div
                                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        4
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Land Interviews</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Apply the improvements and watch your interview callback rate increase.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                whileHover={{ y: -4 }}
                                className="bg-card shadow-md rounded-xl p-6 border border-border transition-shadow hover:shadow-lg"
                            >
                                <motion.div
                                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Target className="w-5 h-5 text-primary" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">ATS Optimization</h3>
                                <p className="text-muted-foreground text-sm mb-4">Get past applicant tracking systems</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Keyword optimization for ATS systems</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Industry-specific skill suggestions</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Format compatibility checks</span>
                                    </li>
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                whileHover={{ y: -4 }}
                                className="bg-card shadow-md rounded-xl p-6 border border-border transition-shadow hover:shadow-lg"
                            >
                                <motion.div
                                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        y: [0, -3, 0]
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5
                                    }}
                                >
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Detailed Scoring</h3>
                                <p className="text-muted-foreground text-sm mb-4">Comprehensive resume breakdown</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Overall score (0-100 scale)</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Severity-rated issues (1-10)</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Strengths and weaknesses analysis</span>
                                    </li>
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                whileHover={{ y: -4 }}
                                className="bg-card shadow-md rounded-xl p-6 border border-border transition-shadow hover:shadow-lg"
                            >
                                <motion.div
                                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                                    animate={{
                                        scale: [1, 1.12, 1],
                                        rotate: [0, 3, -3, 0]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    }}
                                >
                                    <Lightbulb className="w-5 h-5 text-primary" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">Actionable Tips</h3>
                                <p className="text-muted-foreground text-sm mb-4">Clear steps to improve</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Specific action items to implement</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Interview practice questions</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-foreground">
                                        <span className="text-primary font-bold">✓</span>
                                        <span>Job description targeting tools</span>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>

                        {/* Testimonials */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
                                What People Say
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-card shadow-md rounded-xl p-6 border border-border">
                                    <div className="flex items-center mb-4">
                                        <div className="flex text-primary">★★★★★</div>
                                    </div>
                                    <p className="text-foreground text-sm mb-4 italic">
                                        &ldquo;Increased my interview callbacks by 3x after implementing the suggested changes. The ATS tips were game-changing!&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">S</div>
                                        <div>
                                            <p className="font-semibold text-foreground">Sarah M.</p>
                                            <p className="text-xs text-muted-foreground">Software Engineer</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-card shadow-md rounded-xl p-6 border border-border">
                                    <div className="flex items-center mb-4">
                                        <div className="flex text-primary">★★★★★</div>
                                    </div>
                                    <p className="text-foreground text-sm mb-4 italic">
                                        &ldquo;The severity ratings helped me focus on what mattered most. Got an offer within 2 weeks of updating my CV!&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">M</div>
                                        <div>
                                            <p className="font-semibold text-foreground">Michael T.</p>
                                            <p className="text-xs text-muted-foreground">Marketing Manager</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-card shadow-md rounded-xl p-6 border border-border">
                                    <div className="flex items-center mb-4">
                                        <div className="flex text-primary">★★★★★</div>
                                    </div>
                                    <p className="text-foreground text-sm mb-4 italic">
                                        &ldquo;Simple, fast, and incredibly helpful. The keyword suggestions alone were worth it. Highly recommend!&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">E</div>
                                        <div>
                                            <p className="font-semibold text-foreground">Emily R.</p>
                                            <p className="text-xs text-muted-foreground">Data Analyst</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="bg-gradient-to-r from-primary to-[#ff9068] rounded-xl p-8 text-white text-center">
                            <h2 className="text-3xl font-bold mb-6">Why Choose Our CV Analyzer?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-4xl font-bold mb-2">Instant</div>
                                    <p className="text-white/90">Get results in seconds</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold mb-2">£7.99</div>
                                    <p className="text-white/90">One-time payment only</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold mb-2">AI-Powered</div>
                                    <p className="text-white/90">Advanced analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            {!loading && <Footer />}
        </div>
    );
}