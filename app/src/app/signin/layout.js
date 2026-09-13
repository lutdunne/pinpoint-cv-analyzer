"use client";

import { ThemeProvider } from "../(main)/components/ThemeContext";

export default function SignInLayout({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
