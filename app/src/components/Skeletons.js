"use client";

import React from "react";
import { motion } from "framer-motion";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Welcome Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-72 rounded-lg skeleton-shimmer opacity-70" />
        </div>
        <div className="h-10 w-36 rounded-xl skeleton-shimmer" />
      </div>

      {/* Main Overall Score Hero Card Skeleton */}
      <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border/80 card-elevation space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full skeleton-shimmer flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-lg skeleton-shimmer" />
              <div className="h-4 w-52 rounded-md skeleton-shimmer opacity-70" />
              <div className="h-6 w-28 rounded-full skeleton-shimmer" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-3 bg-card-secondary rounded-xl border border-border/70 space-y-2 w-28">
                <div className="h-3 w-14 rounded skeleton-shimmer" />
                <div className="h-5 w-10 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-card-secondary border border-border space-y-2.5">
          <div className="h-4 w-40 rounded skeleton-shimmer" />
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-4/5 rounded skeleton-shimmer opacity-80" />
        </div>
      </div>

      {/* 3-Column Analysis Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-6 bg-card border border-border/80 card-elevation space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
                <div className="h-5 w-32 rounded-lg skeleton-shimmer" />
              </div>
              <div className="space-y-3 pt-1">
                <div className="h-4 w-full rounded-lg skeleton-shimmer" />
                <div className="h-4 w-11/12 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded-lg skeleton-shimmer opacity-80" />
              </div>
            </div>
            <div className="pt-4 border-t border-border space-y-2">
              <div className="h-4 w-36 rounded skeleton-shimmer" />
              <div className="h-3 w-full rounded skeleton-shimmer opacity-70" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Cards Skeleton (Contact, Sections, Keywords) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl p-6 bg-card border border-border/80 card-elevation space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
              <div className="h-5 w-36 rounded-lg skeleton-shimmer" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 rounded-xl bg-card-secondary border border-border/80 skeleton-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InterviewSkeleton() {
  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-72 rounded-lg skeleton-shimmer opacity-70" />
        </div>
        <div className="h-10 w-32 rounded-xl skeleton-shimmer" />
      </div>

      {/* Progress & Category Banner Skeleton */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-48 rounded-lg skeleton-shimmer" />
          <div className="h-5 w-16 rounded-lg skeleton-shimmer" />
        </div>
        <div className="h-2.5 w-full rounded-full bg-card-secondary overflow-hidden">
          <div className="h-full w-1/3 rounded-full skeleton-shimmer" />
        </div>
        <div className="flex gap-2 pt-1">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-7 w-24 rounded-full skeleton-shimmer" />
          ))}
        </div>
      </div>

      {/* 3-Column Question Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-6 bg-card border border-border shadow-xs space-y-4 flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                <div className="w-6 h-6 rounded-lg skeleton-shimmer" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-5/6 rounded skeleton-shimmer" />
                <div className="h-4 w-2/3 rounded skeleton-shimmer opacity-70" />
              </div>
            </div>
            <div className="h-10 w-full rounded-xl skeleton-shimmer mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function JDMatchSkeleton() {
  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-52 rounded-xl skeleton-shimmer" />
        <div className="h-4 w-80 rounded-lg skeleton-shimmer opacity-70" />
      </div>

      {/* Match Score Hero Card Skeleton */}
      <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-36 rounded skeleton-shimmer" />
            <div className="h-14 w-28 rounded-2xl skeleton-shimmer" />
          </div>
          <div className="h-7 w-32 rounded-full skeleton-shimmer" />
        </div>
        <div className="p-4 rounded-xl bg-card-secondary border border-border space-y-2">
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-4/5 rounded skeleton-shimmer opacity-80" />
        </div>
      </div>

      {/* Skills Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl p-6 bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full skeleton-shimmer" />
              <div className="h-5 w-40 rounded-lg skeleton-shimmer" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-8 w-24 rounded-lg skeleton-shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PDFViewerSkeleton() {
  return (
    <div className="flex flex-col w-full h-full p-4 sm:p-6 items-center justify-center space-y-4">
      <div className="w-full max-w-4xl h-12 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between px-4 skeleton-shimmer" />
      <div className="w-full max-w-4xl h-[75vh] rounded-2xl bg-card border border-border shadow-xs skeleton-shimmer" />
    </div>
  );
}
