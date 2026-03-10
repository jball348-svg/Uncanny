import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import { readTxtFile, readDocxFile } from '@/lib/fileReader';

type FileUploadProps = {
  onFileProcess: (text: string, fileName: string) => void;
};

export function FileUpload({ onFileProcess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    const isDocx = file.name.endsWith('.docx');
    const isTxt = file.name.endsWith('.txt');
    
    if (!isDocx && !isTxt) {
      setError('Please upload a .txt or .docx file.');
      return;
    }

    setLoading(true);
    try {
      let text = '';
      if (isTxt) {
        text = await readTxtFile(file);
      } else if (isDocx) {
        text = await readDocxFile(file);
      }
      onFileProcess(text, file.name);
    } catch (err) {
      console.error(err);
      setError('Failed to process file. Please try pasting the text instead.');
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFile(e.target.files[0]);
    }
    // reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-16 text-center transition-all duration-200 cursor-pointer ${isDragging ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' : 'border-zinc-700 hover:border-zinc-500 bg-[#141414]'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".txt,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={onChange} 
        />
        
        {loading ? (
          <p className="text-amber-500 font-medium animate-pulse">Processing file...</p>
        ) : (
          <div className="flex flex-col items-center pointer-events-none">
            <svg className="w-16 h-16 text-zinc-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="text-xl font-medium text-zinc-300 mb-3">Click or drag a file here</p>
            <p className="text-zinc-500 max-w-sm mx-auto">Supports .txt and .docx formatting up to 10,000 words. We'll strip any images.</p>
            {error && <p className="text-red-500 mt-6 text-sm font-medium p-3 bg-red-500/10 rounded">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
