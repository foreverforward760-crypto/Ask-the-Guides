import React, { useState } from 'react';
import { Search, CornerDownLeft, Sparkles, Loader2 } from 'lucide-react';

interface QuestionBarProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  activeQuestion?: string;
}

const SAMPLE_QUESTIONS = [
  "I'm struggling to forgive someone who betrayed me",
  "What do I do with my anger?",
  "How do I face losing someone?",
  "I can't stop crying after a profound loss",
  "Why am I constantly anxious about my future?",
  "How do I conquer restless desire and envy?",
];

export const QuestionBar: React.FC<QuestionBarProps> = ({
  onSubmit,
  isLoading,
  activeQuestion = '',
}) => {
  const [input, setInput] = useState(activeQuestion);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  const handleSelectSample = (sample: string) => {
    setInput(sample);
    onSubmit(sample);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-[#14171f] border-2 border-[#2b3342] focus-within:border-[#c99a4e] rounded-2xl shadow-xl transition-all overflow-hidden">
          <div className="pl-4 sm:pl-5 text-[#80868b]">
            <Search className="w-5 h-5 text-[#c99a4e]" />
          </div>

          <input
            id="question-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a real question — in your own words..."
            disabled={isLoading}
            className="w-full bg-transparent px-3.5 sm:px-4 py-4 text-base sm:text-lg text-[#f1f3f5] placeholder-[#6b7280] focus:outline-none font-sans"
          />

          <div className="pr-3 sm:pr-4 flex items-center gap-2">
            <button
              id="ask-submit-button"
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all ${
                isLoading || !input.trim()
                  ? 'bg-[#1f242e] text-[#5f6368] cursor-not-allowed border border-[#2d3340]'
                  : 'bg-[#c99a4e] hover:bg-[#d8ab5f] text-[#0f1115] shadow-lg shadow-[#c99a4e]/20 font-semibold cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Consulting Sources...</span>
                </>
              ) : (
                <>
                  <span>Consult</span>
                  <CornerDownLeft className="w-4 h-4 opacity-75 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Inquiries / Sample prompts */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-[#9aa0a6]">
        <span className="flex items-center gap-1 text-[#c99a4e] font-mono shrink-0">
          <Sparkles className="w-3 h-3" />
          <span>Try asking:</span>
        </span>
        {SAMPLE_QUESTIONS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSample(sample)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-[#161a22] border border-[#252b38] hover:border-[#c99a4e]/50 hover:bg-[#1f2430] text-[#c4c7c5] hover:text-[#f3dfba] transition-all text-left"
          >
            "{sample}"
          </button>
        ))}
      </div>
    </div>
  );
};
