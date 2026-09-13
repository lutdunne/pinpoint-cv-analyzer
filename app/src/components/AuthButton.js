"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, LayoutDashboard, Upload, ChevronDown, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SettingsModal from "./SettingsModal";

export function AuthButton() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [hasAnalysis, setHasAnalysis] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAnalysis = () => {
            const feedback = localStorage.getItem("feedback");
            setHasAnalysis(!!feedback);
        };
        checkAnalysis();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem("fileUrl");
        localStorage.removeItem("parsedText");
        localStorage.removeItem("feedback");
        localStorage.removeItem("currentResumeId");
        signOut({ callbackUrl: "/signin" });
    };

    if (status === "loading") {
        return (
            <div className="h-8 w-8 rounded-full skeleton-shimmer" />
        );
    }

    if (session) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-card-secondary transition-colors"
                >
                    {session.user?.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-7 h-7 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                        </div>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-foreground-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-xl border border-border/80 z-50 overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-border bg-card-secondary/40">
                                <p className="text-xs font-bold text-foreground truncate">
                                    {session.user?.name || "User"}
                                </p>
                                <p className="text-[11px] text-foreground-secondary truncate">
                                    {session.user?.email}
                                </p>
                            </div>

                            <div className="p-1.5 space-y-0.5">
                                {hasAnalysis && pathname !== '/dashboard' && (
                                    <button
                                        onClick={() => {
                                            router.push('/dashboard');
                                            setIsOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-card-secondary rounded-xl flex items-center gap-2.5 transition-colors"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                                        <span>Dashboard</span>
                                    </button>
                                )}

                                {pathname !== '/upload' && (
                                    <button
                                        onClick={() => {
                                            router.push('/upload');
                                            setIsOpen(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-card-secondary rounded-xl flex items-center gap-2.5 transition-colors"
                                    >
                                        <Upload className="w-3.5 h-3.5 text-primary" />
                                        <span>Upload New CV</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setShowSettings(true);
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-card-secondary rounded-xl flex items-center gap-2.5 transition-colors"
                                >
                                    <Settings className="w-3.5 h-3.5 text-foreground-secondary" />
                                    <span>Settings</span>
                                </button>

                                <div className="border-t border-border my-1" />

                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            </div>
        );
    }

    return (
        <button
            onClick={() => router.push("/signin")}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs active:scale-95"
        >
            Sign In
        </button>
    );
}
