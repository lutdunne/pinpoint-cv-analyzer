'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About Us
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            © {new Date().getFullYear()} CV Analyzer
          </span>
        </div>
      </div>
    </footer>
  );
}
