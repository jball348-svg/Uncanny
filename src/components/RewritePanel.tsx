"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/context/AnalysisContext';
import { generateRewritePrompt, parseRewriteResponse } from '@/lib/rewritePrompt';

export function RewritePanel() {
  const { result, setRewriteResult } = useAnalysis();
  const router = useRouter();
  
  const [state, setState] = useState<'PROMPT_READY' | 'AWAITING_PASTE'>('PROMPT_READY');
  const [textareaValue, setTextareaValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!result) return null;

  const handleGeneratePrompt = async () => {
    const prompt = generateRewritePrompt(result);
    try {
      await navigator.clipboard.writeText(prompt);
      setState('AWAITING_PASTE');
      setErrorMsg(null);
    } catch (err) {
      console.error("Failed to copy prompt", err);
    }
  };

  const handleSubmitRewrite = () => {
    try {
      const parsed = parseRewriteResponse(textareaValue);
      setRewriteResult(parsed);
      router.push('/rewrite');
    } catch (err) {
      setErrorMsg("Couldn't read that response. Make sure you copied the full JSON, and verify there aren't any unescaped double quotes inside the text itself.");
    }
  };

  return (
    <div className="py-8 border-t border-stone-800/50">
      <div className="bg-stone-900/50 rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-medium text-stone-100 mb-2">Improve My Writing</h2>
          <p className="text-stone-400">
            Use Uncanny's forensic analysis to prompt any LLM to rewrite your prose with a more authentic human voice.
          </p>
        </div>

        {state === 'PROMPT_READY' ? (
          <div>
            <button
              onClick={handleGeneratePrompt}
              className="px-6 py-3 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-900 font-medium transition-colors w-full sm:w-auto"
            >
              Generate Improvement Prompt
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-emerald-400">
              Improvement prompt copied to clipboard
            </div>
            
            <p className="text-stone-300">
              Paste that prompt into Gemini (or any LLM), then paste the JSON response it gives you back here:
            </p>
            
            <textarea
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="Paste Gemini's JSON response here..."
              className="w-full min-h-[160px] p-4 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono text-sm placeholder:text-stone-600 focus:outline-none focus:border-stone-600 resize-y"
            />
            
            {errorMsg && (
              <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-400 text-sm">
                {errorMsg}
              </div>
            )}
            
            <button
              onClick={handleSubmitRewrite}
              disabled={!textareaValue.trim()}
              className="px-6 py-3 rounded-lg bg-stone-200 hover:bg-stone-300 disabled:bg-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed text-stone-900 font-medium transition-colors w-full sm:w-auto"
            >
              Submit Rewrite
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
