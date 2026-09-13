"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Clock } from "lucide-react";

export function UsageTracker() {
    const { data: session } = useSession();
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetchUsage();
        }
    }, [session]);

    const fetchUsage = async () => {
        try {
            const response = await fetch("/api/usage");
            if (response.ok) {
                const data = await response.json();
                setUsage(data);
            }
        } catch (error) {
            console.error("Error fetching usage:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!session?.user || loading || !usage) {
        return null;
    }

    const percentage = (usage.used / usage.limit) * 100;

    return (
        <div className="px-3.5 py-3 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                        Daily Analyses
                    </span>
                </div>
                <span className="text-xs font-extrabold text-primary">
                    {usage.remaining} left
                </span>
            </div>

            <div className="w-full bg-card-secondary rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                    className="h-1.5 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-[#ff9068]"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-[10px] text-foreground-secondary">
                {usage.used} of {usage.limit} daily free scans used
            </p>

            {usage.remaining === 0 && (
                <div className="mt-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <p className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                            Quota resets tomorrow
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
