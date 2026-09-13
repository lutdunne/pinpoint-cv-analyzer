"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "./FileUpload";
import LoadingPage from "./LoadingPage";
import { useFeedback } from "./FeedbackContext";

export default function RescoreModal({ isOpen, onClose }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { setFeedback } = useFeedback();

    if (!isOpen) return null;

    const handleUploadAndAnalyse = async (e) => {
        e.preventDefault();
        setLoading(true);

        const text = await handleUploadFile();
        if (!text) {
            setLoading(false);
            return;
        }
        await handleAnalyse(text);
        setLoading(false);
        onClose();
    };

    const handleUploadFile = async () => {
        if (!file) return null;

        const formData = new FormData();
        formData.append("uploaded_file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                localStorage.setItem("fileUrl", base64String);
            };
            reader.readAsDataURL(file);

            return data.text;
        } catch (err) {
            console.error("Upload failed:", err);
            return null;
        }
    };

    const handleAnalyse = async (text) => {
        if (!text) return;

        try {
            const response = await fetch("/api/analyse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Analysis failed: ${errorData.error || 'Unknown error'}`);
                return;
            }

            const data = await response.json();
            localStorage.setItem("parsedText", text);
            
            // Fetch existing feedback to preserve target and interview data
            const existingFeedbackStr = localStorage.getItem("feedback");
            let existingFeedback = {};
            if (existingFeedbackStr) {
                try { existingFeedback = JSON.parse(existingFeedbackStr); } catch (e) {}
            }
            
            const feedbackObj = { ...existingFeedback, resume: data };
            localStorage.setItem("feedback", JSON.stringify(feedbackObj));
            setFeedback(feedbackObj);
        } catch (err) {
            console.error("Analysis failed:", err);
        }
    };

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={loading ? undefined : onClose}
            >
                {loading ? (
                    <LoadingPage />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-foreground">Re-score Résumé</h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs sm:text-sm text-foreground-secondary mb-6 leading-relaxed">
                            Upload a new version of your résumé to get freshly calculated scores and feedback.
                        </p>

                        <form onSubmit={handleUploadAndAnalyse} className="space-y-5">
                            <FileUpload onFileChange={setFile} />

                            {file && (
                                <p className="text-xs text-foreground-secondary">
                                    Selected file: <span className="font-semibold text-foreground">{file.name}</span>
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-card-secondary hover:bg-card-secondary/80 text-foreground font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!file || loading}
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Analyze Résumé</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
}
