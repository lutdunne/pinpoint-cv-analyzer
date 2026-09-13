"use client";

import { ThemeProvider } from "../../(main)/components/ThemeContext";

export default function RegisterLayout({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
