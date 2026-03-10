import React from 'react';
import { VerdictBadge } from './VerdictBadge';
import { AnalysisResult } from '@/lib/aggregator';

interface ScoreDisplayProps {
  result: AnalysisResult;
}

export function ScoreDisplay({ result }: ScoreDisplayProps) {
  // result.overallScore is 0-1
  const percentage = Math.round(result.overallScore * 100);
  
  const radius = 64;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = (perc: number) => {
    if (perc <= 34) return 'text-green-500';
    if (perc <= 65) return 'text-amber-500';
    return 'text-rose-500';
  };

  const colorClass = getColorClass(percentage);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8 py-8">
      {/* Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-stone-800"
          />
          {/* Progress circle */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center pt-1">
          <span className="text-4xl font-bold text-stone-100 leading-none">{percentage}%</span>
        </div>
      </div>

      {/* Badge */}
      <VerdictBadge verdict={result.verdict} verdictLabel={result.verdictLabel} />

      {/* Summary */}
      <div className="text-center text-stone-300 text-lg leading-relaxed font-serif max-w-prose">
        {result.summary}
      </div>
    </div>
  );
}
