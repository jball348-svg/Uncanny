"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisResult } from "@/lib/aggregator";
import { RewriteResult } from "@/lib/rewritePrompt";

interface AnalysisContextType {
  result: AnalysisResult | null;
  setResult: (result: AnalysisResult | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  rewriteResult: RewriteResult | null;
  setRewriteResult: (r: RewriteResult | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);

  const handleSetResult = (newResult: AnalysisResult | null) => {
    setResult(newResult);
    if (newResult === null) {
      setRewriteResult(null);
    }
  };

  return (
    <AnalysisContext.Provider value={{ result, setResult: handleSetResult, isLoading, setIsLoading, rewriteResult, setRewriteResult }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
