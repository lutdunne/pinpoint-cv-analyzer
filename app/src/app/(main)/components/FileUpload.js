"use client";

import { Upload, FileText } from "lucide-react";

export default function FileUpload({ onFileChange }) {
    return (
        <div className="relative w-full group">
            <input
                type="file"
                className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                accept=".pdf,.txt"
                onChange={(e) => onFileChange(e.target.files[0])}
            />
            <div className="relative z-40 cursor-pointer bg-card-secondary border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center h-48 sm:h-52 w-full rounded-2xl shadow-xs">
                <div className="bg-card p-4 rounded-2xl mb-3 border border-border group-hover:border-primary/40 group-hover:scale-105 transition-all text-foreground-secondary group-hover:text-primary shadow-xs">
                    <Upload className="w-7 h-7" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                    Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-foreground-secondary mt-1">
                    PDF or TXT (up to 10MB)
                </p>
            </div>
        </div>
    );
}
