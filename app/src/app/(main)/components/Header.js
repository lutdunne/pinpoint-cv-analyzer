"use client";

import { FileUp, Code2, Menu, X, FileText, LayoutDashboard } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";
import { useView } from "./ViewContext";
import { useDeveloperMode } from "./DeveloperModeContext";
import { AuthButton } from "@/components/AuthButton";

export default function Header({ setIsModalOpen }) {
  const { currentView, setCurrentView, isMobileMenuOpen, toggleMobileMenu } = useView();
  const { isDeveloperMode } = useDeveloperMode();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 h-16 min-h-[64px] max-h-[64px] px-4 sm:px-6 transition-colors glass-panel shadow-xs">
      {/* Left Side: Mobile Menu Button & Developer Mode Indicator */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-card-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Developer Mode Indicator */}
        {isDeveloperMode && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            <Code2 className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Dev Mode</span>
          </div>
        )}
      </div>

      {/* Right Side Navigation Actions */}
      <nav className="flex items-center gap-2 sm:gap-3 ml-auto">
        <button
          onClick={() => {
            if (currentView === "pdf") {
              setCurrentView("resume");
            } else {
              setCurrentView("pdf");
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all"
        >
          {currentView === "pdf" ? (
            <>
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="hidden xs:inline">Dashboard</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-primary" />
              <span className="hidden xs:inline">View PDF</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95"
        >
          <span>Re-score</span>
          <FileUp className="w-3.5 h-3.5" />
        </button>

        <div className="border-l border-border pl-2 sm:pl-3 flex items-center">
          <ThemeSwitch />
        </div>

        <div className="pl-1">
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}
