import React, { useState } from 'react';

interface SentenceChipProps {
  text: string;
  finalScore: number;
  reason?: string;
  isSpaceTrailing?: boolean;
}

export function SentenceChip({ text, finalScore, reason, isSpaceTrailing = true }: SentenceChipProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getHighlightClass = (score: number) => {
    if (score < 0.3) return "bg-transparent hover:bg-stone-800/30";
    if (score < 0.5) return "bg-amber-500/10 text-stone-200 border-b border-amber-500/20";
    if (score < 0.7) return "bg-amber-500/20 text-amber-50 border-b border-amber-500/40";
    return "bg-rose-500/20 text-rose-50 border-b border-rose-500/40";
  };

  const pct = Math.round(finalScore * 100);
  const displayReason = reason ? reason : "Statistical pattern detected";

  return (
    <span 
      className="relative"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setIsHovered(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setIsHovered(false); }}
      onClick={() => setIsHovered(!isHovered)}
    >
      <span className={`transition-colors duration-200 rounded-sm cursor-help ${getHighlightClass(finalScore)}`}>
        {text}
      </span>
      {isHovered && finalScore >= 0.3 && (
        <span className="absolute bottom-full left-0 mb-1 w-72 max-w-[80vw] p-4 bg-stone-900/95 backdrop-blur-sm border border-stone-700/80 rounded-xl shadow-2xl z-20 text-sm text-stone-200 font-sans pointer-events-none">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-800">
            <span className={`font-mono text-xs font-bold ${finalScore >= 0.7 ? 'text-rose-400' : 'text-amber-400'}`}>
              {pct}% AI
            </span>
          </div>
          <div className="leading-snug text-stone-300">{displayReason}</div>
        </span>
      )}
      {isSpaceTrailing && " "}
    </span>
  );
}
