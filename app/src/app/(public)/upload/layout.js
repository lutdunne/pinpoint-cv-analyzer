"use client";

import { ThemeProvider } from "../../(main)/components/ThemeContext";

export default function UploadLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="bg-background text-foreground min-h-screen overflow-auto">
        {children}
      </div>
    </ThemeProvider>
  );
}