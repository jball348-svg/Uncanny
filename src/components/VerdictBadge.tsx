import React from 'react';

interface VerdictBadgeProps {
  verdict: "likely-human" | "mixed" | "ai-influence";
  verdictLabel: string;
}

export function VerdictBadge({ verdict, verdictLabel }: VerdictBadgeProps) {
  const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");
  
  return (
    <div className={cn(
      "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase shadow-sm border",
      verdict === "likely-human" && "bg-green-900/40 text-green-300 border-green-800",
      verdict === "mixed" && "bg-amber-900/40 text-amber-300 border-amber-800",
      verdict === "ai-influence" && "bg-rose-900/40 text-rose-300 border-rose-800"
    )}>
      {verdictLabel}
    </div>
  );
}
