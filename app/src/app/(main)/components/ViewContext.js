"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ViewContext = createContext();

export function ViewProvider({ children }) {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("currentView") || "resume";
    }
    return "resume";
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("currentView", currentView);
    }
  }, [currentView]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const setViewAndCloseMenu = useCallback((view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      const container = document.getElementById("main-scroll-container");
      if (container) container.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const mainEl = document.querySelector("main");
      if (mainEl) mainEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <ViewContext.Provider
      value={{
        currentView,
        setCurrentView: setViewAndCloseMenu,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}