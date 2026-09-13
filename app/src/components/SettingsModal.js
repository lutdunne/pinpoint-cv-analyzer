"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Database, Cpu, AlertTriangle } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { ALLOWED_MODELS, DEFAULT_MODEL } from "@/lib/constants";

export default function SettingsModal({ isOpen, onClose }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
    const [showDeleteDataConfirm, setShowDeleteDataConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedModel = localStorage.getItem("aiModel");
        if (savedModel && ALLOWED_MODELS.includes(savedModel)) {
            setSelectedModel(savedModel);
        } else {
            setSelectedModel(DEFAULT_MODEL);
        }
    }, []);

    const handleModelChange = (model) => {
        setSelectedModel(model);
        localStorage.setItem("aiModel", model);
    };

    const handleDeleteAllData = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch("/api/resumes/delete-all", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete data");
            }

            localStorage.removeItem("fileUrl");
            localStorage.removeItem("parsedText");
            localStorage.removeItem("feedback");
            localStorage.removeItem("currentResumeId");

            alert("All analysis data has been deleted successfully");
            setShowDeleteDataConfirm(false);
            onClose();
            router.push("/upload");
        } catch (error) {
            console.error("Error deleting data:", error);
            alert("Failed to delete data. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch("/api/user/delete-account", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete account");
            }

            localStorage.removeItem("fileUrl");
            localStorage.removeItem("parsedText");
            localStorage.removeItem("feedback");
            localStorage.removeItem("currentResumeId");
            localStorage.removeItem("aiModel");

            alert("Your account has been deleted successfully");
            signOut({ callbackUrl: "/signin" });
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete account. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border">
                        <h2 className="text-lg font-bold text-foreground">Preferences & Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 space-y-6">
                        {/* AI Model Selection */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Cpu className="w-4 h-4 text-foreground" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">AI Model</h3>
                            </div>
                            <p className="text-xs text-foreground-secondary mb-3">
                                Choose the OpenAI model for analyzing your resume
                            </p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-card-secondary cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="model"
                                        value="gpt-4o-mini"
                                        checked={selectedModel === "gpt-4o-mini"}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        className="w-4 h-4 text-primary focus:ring-ring"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-foreground">GPT-4o Mini</p>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded">DEFAULT</span>
                                        </div>
                                        <p className="text-xs text-foreground-secondary">Fast, inexpensive production workloads</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-card-secondary cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="model"
                                        value="gpt-4o"
                                        checked={selectedModel === "gpt-4o"}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        className="w-4 h-4 text-primary focus:ring-ring"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">GPT-4o</p>
                                        <p className="text-xs text-foreground-secondary">Highest capability for complex tasks</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Delete All Analysis Data */}
                        <div className="border-t border-border pt-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-4 h-4 text-destructive" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Clear Analysis Data</h3>
                            </div>
                            <p className="text-xs text-foreground-secondary mb-3">
                                Delete all cached résumé analyses while keeping your account active.
                            </p>
                            {!showDeleteDataConfirm ? (
                                <button
                                    onClick={() => setShowDeleteDataConfirm(true)}
                                    className="w-full px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Delete All Data
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-destructive leading-relaxed">
                                            Permanently deletes all résumé scans and feedback history.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowDeleteDataConfirm(false)}
                                            className="flex-1 px-3 py-2 bg-card-secondary text-foreground hover:bg-card-secondary/80 rounded-xl text-xs font-semibold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAllData}
                                            disabled={isDeleting}
                                            className="flex-1 px-3 py-2 bg-destructive text-white hover:bg-destructive/90 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Delete Account */}
                        <div className="border-t border-border pt-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Trash2 className="w-4 h-4 text-destructive" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Delete Account</h3>
                            </div>
                            <p className="text-xs text-foreground-secondary mb-3">
                                Permanently delete your user profile and all personal records.
                            </p>
                            {!showDeleteAccountConfirm ? (
                                <button
                                    onClick={() => setShowDeleteAccountConfirm(true)}
                                    className="w-full px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Delete Account
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-destructive leading-relaxed">
                                            This action is irreversible and deletes your account completely.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowDeleteAccountConfirm(false)}
                                            className="flex-1 px-3 py-2 bg-card-secondary text-foreground hover:bg-card-secondary/80 rounded-xl text-xs font-semibold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className="flex-1 px-3 py-2 bg-destructive text-white hover:bg-destructive/90 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
