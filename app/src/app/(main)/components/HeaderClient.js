"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import SessionProvider from "./SessionProvider";
import RescoreModal from "./RescoreModal";
import { useView } from "./ViewContext";

export default function HeaderClient({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const { currentView } = useView();

  // Ensure every view/page switch resets scroll position to the very top
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);

      const scrollContainer = document.getElementById("main-scroll-container");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      const mainEl = document.querySelector("main");
      if (mainEl) {
        mainEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }
  }, [pathname, currentView]);

  return (
    <SessionProvider>
      <Header setIsModalOpen={setIsModalOpen} />
      {children}
      <RescoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </SessionProvider>
  );
}