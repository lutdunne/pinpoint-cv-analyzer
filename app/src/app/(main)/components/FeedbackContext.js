"use client";
import { createContext, useContext, useState, useEffect } from "react";

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [feedback, setFeedback] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [interviewFreeQuestionsReady, setInterviewFreeQuestionsReady] = useState(false);
  const [interviewPartialQuestions, setInterviewPartialQuestions] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("feedback");
      if (saved) {
        setFeedback(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load feedback from localStorage:", e);
    }
  }, []);

  return (
    <FeedbackContext.Provider value={{ 
      feedback, setFeedback,
      interviewLoading, setInterviewLoading,
      interviewProgress, setInterviewProgress,
      interviewFreeQuestionsReady, setInterviewFreeQuestionsReady,
      interviewPartialQuestions, setInterviewPartialQuestions
    }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}