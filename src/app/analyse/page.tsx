"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/TextInput';
import { FileUpload } from '@/components/FileUpload';

export default function AnalysePage() {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'info' | 'error', text: string} | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  const handleFileProcess = (extractedText: string, name: string) => {
    setText(extractedText);
    setFileName(name);
    setMessage(null);
  };

  const handleAnalyse = () => {
    console.log("Analysing text:", text.substring(0, 100) + '...');
    setMessage({ 
      type: 'info', 
      text: 'Analysis coming in Phase 2...' 
    });
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
            <TextInput value={text} onChange={(val) => { setText(val); setFileName(null); setMessage(null); }} />
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
              onClick={handleAnalyse} 
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

            {message && message.type === 'info' && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-5 py-3 rounded-lg flex-1 flex items-center shadow-inner">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
