"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFeedback } from "@/app/(main)/components/FeedbackContext";

export function ResumeHistory() {
    const { data: session } = useSession();
    const router = useRouter();
    const { setFeedback } = useFeedback();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        if (session?.user) {
            fetchResumes();
        }
    }, [session]);

    const fetchResumes = async () => {
        try {
            const response = await fetch("/api/resumes");
            if (response.ok) {
                const data = await response.json();
                setResumes(data.resumes || []);
            }
        } catch (error) {
            console.error("Error fetching résumés:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/resumes/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setResumes(resumes.filter(r => r.id !== id));
                const currentResumeId = localStorage.getItem('currentResumeId');
                if (currentResumeId === id) {
                    localStorage.removeItem('feedback');
                    localStorage.removeItem('parsedText');
                    localStorage.removeItem('fileUrl');
                    localStorage.removeItem('currentResumeId');
                }
                setDeleteModal(null);
            }
        } catch (error) {
            console.error("Error deleting résumé:", error);
        }
    };

    const handleView = async (id) => {
        try {
            const response = await fetch(`/api/resumes/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                alert('Failed to load resume: ' + (errorData.error || 'Unknown error'));
                return;
            }

            const data = await response.json();
            if (!data.resume || !data.resume.feedback) {
                alert('No feedback found in resume.');
                return;
            }

            const feedbackObj = { 
                resume: {
                    ...data.resume.feedback,
                    isPaid: data.resume.isPaid
                } 
            };
            localStorage.setItem('feedback', JSON.stringify(feedbackObj));
            localStorage.setItem('parsedText', data.resume.parsedText || '');
            localStorage.setItem('fileUrl', data.resume.fileData || '');
            localStorage.setItem('currentResumeId', id);

            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Error loading résumé:", error);
            alert('Error: ' + error.message);
        }
    };

    if (!session?.user || loading || resumes.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-[11px] font-bold text-foreground-secondary uppercase tracking-wider px-2 py-1 hover:text-primary transition-colors group"
            >
                <span>History ({resumes.length})</span>
                {expanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                )}
            </button>

            {expanded && (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="p-2.5 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors group"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate mb-1" title={resume.fileName}>
                                        {resume.fileName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {resume.feedback?.score && (
                                            <span className="text-xs font-bold text-primary">
                                                {resume.feedback.score}%
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-foreground-secondary" />
                                            <p className="text-[10px] text-foreground-secondary">
                                                {new Date(resume.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => handleView(resume.id)}
                                        className="p-1 hover:bg-card-secondary rounded-lg transition-colors"
                                        title="View analysis"
                                    >
                                        <Eye className="w-3.5 h-3.5 text-primary" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal(resume)}
                                        className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                                        title="Delete résumé"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <div
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                        onClick={() => setDeleteModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-destructive/10 text-destructive rounded-xl">
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Delete Résumé Record
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="p-1 text-foreground-secondary hover:text-foreground rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs sm:text-sm text-foreground-secondary mb-2">
                                Are you sure you want to delete <span className="font-semibold text-foreground break-all">{deleteModal.fileName}</span>?
                            </p>
                            <p className="text-xs text-foreground-secondary mb-6">
                                This will permanently delete this analysis. This action cannot be undone.
                            </p>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="px-4 py-2 text-xs font-semibold text-foreground hover:bg-card-secondary rounded-xl transition-colors border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteModal.id)}
                                    className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 rounded-xl transition-colors text-xs font-semibold shadow-xs"
                                >
                                    Delete Résumé
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
