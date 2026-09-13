"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Wait for session to load
      if (status === "loading") return;

      // Check for last visited page in localStorage
      const lastVisitedPage = localStorage.getItem("lastVisitedPage");

      if (lastVisitedPage && lastVisitedPage !== "/") {
        // Restore to last visited page
        router.replace(lastVisitedPage);
        return;
      }

      // If authenticated, check if user has any analysis
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch("/api/user-analysis");
          const { hasAnalysis } = await response.json();

          if (!hasAnalysis) {
            // No analysis exists, go to upload
            router.replace("/upload");
            return;
          }
        } catch (error) {
          console.error("Failed to check user analysis:", error);
        }
      }

      // Check localStorage for feedback
      const savedFeedback = localStorage.getItem("feedback");
      if (!savedFeedback) {
        // No saved feedback, go to upload
        router.replace("/upload");
        return;
      }

      // Default to dashboard if has analysis
      router.replace("/dashboard");
    };

    checkAndRedirect();
  }, [router, session, status]);

  return null;
}