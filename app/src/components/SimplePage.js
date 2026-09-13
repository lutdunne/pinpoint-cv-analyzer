'use client';

import Link from 'next/link';
import { Pin } from 'lucide-react';
import Footer from './Footer';

export default function SimplePage({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Simple Header with Logo/Home Button */}
      <header className="w-full border-b border-gray-200 dark:border-gray-800 py-4 px-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
          >
            <Pin className="text-[#e67b77] w-6 h-6" />
            <h1 className="text-xl font-bold">PinPoint</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
