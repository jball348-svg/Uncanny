"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/TextInput';
import { FileUpload } from '@/components/FileUpload';
import { useAnalysis } from '@/context/AnalysisContext';
import { analyseHeuristics, splitSentences, HeuristicsResult } from '@/lib/heuristics';
import { generateGeminiPrompt, parseGeminiResponse } from '@/lib/geminiPrompt';
import { aggregateResults } from '@/lib/aggregator';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function AnalysePage() {
  const router = useRouter();
  const { setResult, isLoading, setIsLoading } = useAnalysis();
  
  const [step, setStep] = useState<'input' | 'llm'>('input');
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  
  // State for Step 2
  const [heuristicsResult, setHeuristicsResult] = useState<HeuristicsResult | null>(null);
  const [promptString, setPromptString] = useState<string>('');
  const [sentences, setSentences] = useState<string[]>([]);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  const handleFileProcess = (extractedText: string, name: string) => {
    setText(extractedText);
    setFileName(name);
    setErrorMsg(null);
  };

  const handleStartAnalysis = () => {
    if (wordCount < 200 || wordCount > 10000) return;
    
    // 1. Run local heuristics
    const hResult = analyseHeuristics(text);
    setHeuristicsResult(hResult);

    // 2. Generate prompt
    const sents = splitSentences(text);
    setSentences(sents);
    const pString = generateGeminiPrompt(text, sents);
    setPromptString(pString);

    // 3. Move to next step
    setStep('llm');
    window.scrollTo(0, 0);
  };

  const handleCompleteAnalysis = async () => {
    setErrorMsg(null);
    try {
      if (!heuristicsResult) throw new Error("Missing heuristics data.");
      
      const geminiResult = parseGeminiResponse(jsonInput);
      const finalResult = aggregateResults(heuristicsResult, geminiResult, sentences);
      
      setIsLoading(true);
      
      // Simulate small delay for loading screen
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setResult(finalResult);
      router.push('/results');
      setIsLoading(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Invalid JSON format. Please try pasting again.");
      }
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptString);
      alert("Prompt copied to clipboard!");
    } catch {
      alert("Failed to copy. Please manually select and copy the text.");
    }
  };

  const getValidationMessage = () => {
    if (wordCount > 0 && wordCount < 200) {
      return "Your text is too short. Please paste at least 200 words.";
    }
    if (wordCount > 10000) {
      return "Your text exceeds the 10,000 word limit. Please trim it before analysing.";
    }
    return null;
  };

  const validationMessage = getValidationMessage();
  const isValid = wordCount >= 200 && wordCount <= 10000;

  if (step === 'llm') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8] font-sans selection:bg-amber-500/30">
        <main className="max-w-4xl mx-auto px-6 py-16">
          <button onClick={() => setStep('input')} className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-amber-500 transition-colors mb-10">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Text Input
          </button>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Manual LLM Analysis</h1>
          <p className="text-zinc-400 text-lg sm:text-xl mb-12 pb-8 border-b border-zinc-800/80">
            To avoid API costs during development, please copy the prompt below, paste it into ChatGPT/Claude/Gemini, and paste the resulting JSON back here.
          </p>

          <div className="mb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-amber-500">1. Copy Prompt</h2>
              <Button onClick={copyToClipboard} className="px-4 py-2 text-sm bg-[#1a1a1a] border border-zinc-700 hover:bg-[#2a2a2a] text-zinc-200">
                Copy to Clipboard
              </Button>
            </div>
            <div className="w-full h-64 bg-[#141414] border border-zinc-800 rounded-xl p-4 overflow-auto">
              <pre className="text-sm text-zinc-400 font-mono whitespace-pre-wrap">{promptString}</pre>
            </div>
          </div>

          <div className="mb-10 space-y-4">
            <h2 className="text-xl font-semibold text-amber-500">2. Paste JSON Response</h2>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste the exact JSON response here. It should start with { "overallScore": ...'
              className="w-full h-64 bg-[#141414] border border-zinc-800 rounded-xl p-4 text-zinc-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-col items-start gap-5 bg-[#141414] border border-zinc-800 p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
              <Button 
                onClick={handleCompleteAnalysis} 
                disabled={!jsonInput.trim()}
                className="w-full sm:w-auto text-lg px-12 py-4"
              >
                Complete Analysis
              </Button>

              {errorMsg && (
                <p className="text-red-400 font-medium text-sm flex-1">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        </main>
        <LoadingOverlay isVisible={isLoading} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8] font-sans selection:bg-amber-500/30">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-amber-500 transition-colors mb-10">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Check Your Prose</h1>
        <p className="text-zinc-400 text-lg sm:text-xl mb-12 pb-8 border-b border-zinc-800/80">
          Paste your text below, or upload a .txt or .docx file. Minimum 200 words, maximum 10,000 words.
        </p>

        <div className="flex gap-2 mb-8 bg-[#1a1a1a] p-1.5 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab('paste')}
            className={`px-6 py-2.5 font-medium rounded-md transition-all ${activeTab === 'paste' ? 'bg-[#2a2a2a] text-amber-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#222]'}`}
          >
            Paste Text
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2.5 font-medium rounded-md transition-all ${activeTab === 'upload' ? 'bg-[#2a2a2a] text-amber-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#222]'}`}
          >
            Upload File
          </button>
        </div>

        <div className="mb-10 lg:min-h-[400px]">
          {activeTab === 'paste' ? (
            <TextInput value={text} onChange={(val) => { setText(val); setFileName(null); setErrorMsg(null); }} />
          ) : (
            <div className="flex flex-col gap-8">
              <FileUpload onFileProcess={handleFileProcess} />
              {fileName && (
                <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded inline-block">
                      {fileName}
                    </h3>
                    <span className="text-sm font-medium text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full">{wordCount.toLocaleString()} words</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 pl-1 border-l-2 border-zinc-800">
                    {text.substring(0, 300)}...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-5 bg-[#141414] border border-zinc-800 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
            <Button 
              onClick={handleStartAnalysis} 
              disabled={!isValid}
              className="w-full sm:w-auto text-lg px-12 py-4"
            >
              Analyse
            </Button>

            {validationMessage && (
              <p className="text-red-400 font-medium text-sm flex-1">
                {validationMessage}
              </p>
            )}
          </div>
        </div>
      </main>
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
