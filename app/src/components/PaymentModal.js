"use client";

import { useState } from "react";
import { X, Lock, Check, Zap, Sparkles, CreditCard, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PaymentModal({ isOpen, onClose, score, onPaymentSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: localStorage.getItem("currentResumeId"),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create payment session");
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (err) {
            console.error("Payment error:", err);
            setError("Failed to process payment. Please try again.");
            setLoading(false);
        }
    };

    const missingSkills = 6;
    const improvements = 12;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-primary to-[#ff9068] p-6 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-7 h-7 text-white" />
                            <h2 className="text-2xl font-extrabold tracking-tight">Unlock Full Report</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-white/90">Get your complete CV analysis and step-by-step improvement plan</p>
                    </div>

                    {/* Score Preview */}
                    <div className="p-5 sm:p-6 bg-card-secondary/70 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-1">Your CV Score</p>
                                <p className="text-4xl font-extrabold text-primary">{score}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-foreground-secondary mb-1">Missing</p>
                                <p className="text-2xl font-bold text-foreground">{missingSkills} key skills</p>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                                ⚠️ You&apos;re missing critical keywords that could filter you out of ATS screening
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="p-5 sm:p-6 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Full Report Includes:</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                    <Check className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-foreground">Complete Score Breakdown</p>
                                    <p className="text-xs text-foreground-secondary">Detailed analysis of every section</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                    <Check className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-foreground">CV Rewrite Suggestions ({improvements}+)</p>
                                    <p className="text-xs text-foreground-secondary">Line-by-line improvements to boost your score</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                    <Check className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-foreground">ATS Optimization Tips</p>
                                    <p className="text-xs text-foreground-secondary">Pass applicant tracking systems</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                    <Check className="w-3 h-3" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-foreground">Missing Skills & Keywords</p>
                                    <p className="text-xs text-foreground-secondary">Know exactly what to add</p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Box */}
                        <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <div className="flex items-center justify-between mb-1.5">
                                <div>
                                    <p className="text-xs text-foreground-secondary font-medium">One-time payment</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold text-foreground">£7.99</span>
                                        <span className="text-xs text-foreground-secondary line-through">£14.99</span>
                                    </div>
                                </div>
                                <div className="px-2.5 py-1 bg-destructive text-white text-[11px] font-bold rounded-full">
                                    47% OFF
                                </div>
                            </div>
                            <p className="text-[11px] text-foreground-secondary flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-primary" /> No subscription • Instant access
                            </p>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full mt-4 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs sm:text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 shadow-xs"
                        >
                            {loading ? (
                                <span>Processing...</span>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Unlock Full Report - £7.99
                                </>
                            )}
                        </button>

                        {error && (
                            <p className="mt-2 text-xs text-destructive text-center">{error}</p>
                        )}

                        <p className="mt-3 text-[11px] text-center text-foreground-secondary flex items-center justify-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500" /> Secure checkout</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> All major cards</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
