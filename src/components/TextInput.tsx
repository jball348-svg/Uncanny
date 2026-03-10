import { ChangeEvent } from 'react';

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TextInput({ value, onChange }: TextInputProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  
  let wordCountColor = 'text-zinc-500';
  if (wordCount >= 10000) wordCountColor = 'text-red-500 font-medium';
  else if (wordCount >= 9000) wordCountColor = 'text-amber-500';

  return (
    <div className="w-full flex flex-col gap-2 h-full">
      <textarea
        className="w-full min-h-[350px] bg-[#141414] border border-zinc-800 rounded-lg p-6 text-[#f5f0e8] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y placeholder:text-zinc-600 text-lg leading-relaxed shadow-inner"
        placeholder="Paste your prose here..."
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
      <div className={`text-sm text-right ${wordCountColor}`}>
        {wordCount.toLocaleString()} / 10,000 words
      </div>
    </div>
  );
}
