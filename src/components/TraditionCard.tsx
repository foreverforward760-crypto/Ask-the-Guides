import React, { useState } from 'react';
import { TraditionAnswer } from '../types.ts';
import { BookOpen, Compass, ChevronDown, ChevronUp, Quote, ExternalLink, Bookmark } from 'lucide-react';

interface TraditionCardProps {
  answer: TraditionAnswer;
}

export const TraditionCard: React.FC<TraditionCardProps> = ({ answer }) => {
  const [expandedPassageIndex, setExpandedPassageIndex] = useState<number | null>(0);
  const [showAllPassages, setShowAllPassages] = useState<boolean>(false);

  const displayedPassages = showAllPassages ? answer.passages : answer.passages.slice(0, 1);

  return (
    <div
      className="rounded-2xl border bg-[#13161c] overflow-hidden flex flex-col justify-between shadow-lg transition-all hover:shadow-xl"
      style={{ borderColor: answer.color.border }}
    >
      {/* Top Header: Color coded by tradition */}
      <div
        className="px-4 sm:px-5 py-3.5 border-b flex items-center justify-between gap-3"
        style={{
          backgroundColor: answer.color.bg,
          borderBottomColor: answer.color.border,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: answer.color.text }}
          />
          <div>
            <h3
              className="text-base sm:text-lg font-bold font-cinzel tracking-wide leading-tight"
              style={{ color: answer.color.text }}
            >
              {answer.passages[0]?.work || answer.traditionName}
            </h3>
            <span className="text-[11px] font-mono text-[#9aa0a6]">
              {answer.traditionName} · {answer.group}
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border ${answer.color.badge}`}
        >
          {answer.passages[0]?.work || 'Sacred Text'}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col">
        {/* ========================================================================= */}
        {/* LAYER 1: THE PASSAGES THEMSELVES */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[#c99a4e]">
            <span className="flex items-center gap-1.5 font-semibold">
              <Quote className="w-3.5 h-3.5" />
              <span>Layer 1 · The Passages Themselves</span>
            </span>
            <span className="text-[10px] text-[#80868b] lowercase font-sans">
              (primary source words)
            </span>
          </div>

          <div className="space-y-3">
            {displayedPassages.map((passage, idx) => (
              <div
                key={passage.id || idx}
                className="bg-[#191d26] border border-[#2b3140] rounded-xl p-4 relative group"
              >
                {/* Citation & Language Banner */}
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#252b38] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f5ebd7] font-serif-reader text-sm">
                      {passage.citation}
                    </span>
                    {passage.originalLanguage && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202633] text-[#9aa0a6] border border-[#2c3444]">
                        {passage.originalLanguage}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#8ab4f8] font-medium truncate max-w-[140px] sm:max-w-none">
                    {passage.author}
                  </span>
                </div>

                {/* The actual words of the passage */}
                <blockquote className="font-source-serif italic text-[#f3dfba] text-base sm:text-[17px] leading-relaxed relative pl-3.5 border-l-2 border-[#c99a4e]/60 my-2">
                  "{passage.text}"
                </blockquote>

                {/* Translator and Edition Listed (Not Yet Verified) */}
                <div className="mt-3 pt-2.5 border-t border-[#232835] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#80868b] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#a0a5ab]">Translator listed:</span>
                    <span className="text-[#c4c7c5]">{passage.translator}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#a0a5ab]">Edition listed:</span>
                    <span className="text-[#9aa0a6] italic truncate max-w-[200px]">
                      {passage.edition}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-[#c99a4e]">AI reading below · not doctrine</span>
                  <span className="text-amber-200/70">Editorial review pending</span>
                </div>

                {/* Optional Context Note */}
                {passage.contextNote && (
                  <div className="mt-2 text-[11px] text-[#9aa0a6] bg-[#12151c] p-2 rounded border border-[#202530] font-sans">
                    <span className="text-[#c99a4e] font-medium font-mono mr-1.5">Editorial note (unverified):</span>
                    {passage.contextNote}
                  </div>
                )}
              </div>
            ))}

            {/* Toggle if tradition has multiple matching passages */}
            {answer.passages.length > 1 && (
              <button
                onClick={() => setShowAllPassages(!showAllPassages)}
                className="w-full py-1 text-center text-xs font-mono text-[#8ab4f8] hover:text-[#b3cfff] flex items-center justify-center gap-1"
              >
                {showAllPassages ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Show primary passage only</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>View +{answer.passages.length - 1} more companion passage</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 2: WHAT THE SOURCES SAY */}
        {/* ========================================================================= */}
        <div className="bg-[#161a22] border border-[#272d3b] rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#8ab4f8]">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-semibold">Layer 2 · AI Reading of the Supplied Excerpt</span>
          </div>
          <p className="text-xs sm:text-sm text-[#d2d6dc] leading-relaxed">
            {answer.whatSourcesSay}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 3: HOW IT APPLIES */}
        {/* ========================================================================= */}
        <div className="bg-[#181c25] border border-[#2d3444] rounded-xl p-3.5 space-y-1.5 mt-auto">
          <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#6ee7b7]">
            <Compass className="w-3.5 h-3.5" />
            <span className="font-semibold">Layer 3 · Possible Reflection</span>
          </div>
          <p className="text-xs sm:text-sm text-[#e8eaed] leading-relaxed font-sans">
            {answer.howItApplies}
          </p>
        </div>
      </div>
    </div>
  );
};
