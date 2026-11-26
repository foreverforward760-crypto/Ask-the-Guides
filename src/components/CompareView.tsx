import React from 'react';
import { ComparisonInsight, TraditionAnswer } from '../types.ts';
import { GitCompare, CheckCircle2, Split, Flame, BookOpen, Quote } from 'lucide-react';

interface CompareViewProps {
  comparison?: ComparisonInsight;
  answers: TraditionAnswer[];
  question: string;
}

export const CompareView: React.FC<CompareViewProps> = ({
  comparison,
  answers,
  question,
}) => {
  if (!comparison) {
    return (
      <div className="p-8 text-center text-[#80868b] bg-[#14171f] rounded-2xl border border-[#252b38]">
        Select two or more traditions to surface comparative insights.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#151922] border border-[#2d3444] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c99a4e]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252b38] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c99a4e]/10 border border-[#c99a4e]/30 flex items-center justify-center text-[#c99a4e]">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#f5ebd7]">
                Comparative Synthesis & Dialectic Tension
              </h3>
              <p className="text-xs text-[#9aa0a6]">
                Analyzing {answers.length} traditions on: <span className="text-[#f1f3f5] italic">"{question}"</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {answers.map((a) => (
              <span
                key={a.traditionId}
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: a.color.bg,
                  borderColor: a.color.border,
                  color: a.color.text,
                }}
              >
                {a.traditionName}
              </span>
            ))}
          </div>
        </div>

        {/* Central Tension Banner */}
        <div className="bg-[#1c212d] border border-[#374154] rounded-xl p-4 flex items-start gap-3">
          <div className="mt-0.5 p-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold block mb-1">
              Possible Tension in the Supplied Excerpts
            </span>
            <p className="text-sm sm:text-base text-[#e8eaed] leading-relaxed font-sans">
              {comparison.keyTension}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Convergence vs Divergence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points of Convergence */}
        <div className="bg-[#13161d] border border-[#1e3a2b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e3a2b]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="font-cinzel text-base font-bold text-emerald-300">
                Where the Supplied Excerpts May Converge
              </h4>
              <p className="text-xs text-[#758a7d]">
                Potential parallels in the supplied excerpts; not universal claims
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {comparison.convergence.map((pt, i) => (
              <div
                key={i}
                className="bg-[#161d19] border border-[#244231] rounded-xl p-3.5 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs sm:text-sm text-[#d1e7dd] leading-relaxed">
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Points of Divergence */}
        <div className="bg-[#15161c] border border-[#4a2e2b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-[#4a2e2b]">
            <Split className="w-5 h-5 text-rose-400" />
            <div>
              <h4 className="font-cinzel text-base font-bold text-rose-300">
                Where the Traditions Genuinely Part
              </h4>
              <p className="text-xs text-[#997775]">
                Fundamental irreconcilable theological & philosophical departures
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {comparison.divergence.map((pt, i) => (
              <div
                key={i}
                className="bg-[#1f1717] border border-[#4d2825] rounded-xl p-3.5 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-rose-950 border border-rose-700/60 text-rose-300 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs sm:text-sm text-[#f5d0cd] leading-relaxed">
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Tradition Stance Matrix */}
      <div className="bg-[#14171f] border border-[#252b38] rounded-2xl p-5 sm:p-6 space-y-4">
        <h4 className="font-cinzel text-base font-bold text-[#e8eaed] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#c99a4e]" />
          <span>Council Stance Comparison Table</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#2a313f] text-[#80868b] font-mono text-[11px] uppercase">
                <th className="py-3 px-3">Tradition</th>
                <th className="py-3 px-3">Primary Passage</th>
                <th className="py-3 px-3">Summary of Source</th>
                <th className="py-3 px-3">Direct Practical Mandate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202530]">
              {answers.map((ans) => {
                const passage = ans.passages[0];
                return (
                  <tr key={ans.traditionId} className="hover:bg-[#181c25] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#f1f3f5] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: ans.color.text }}
                        />
                        <span>{ans.traditionName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#c99a4e] whitespace-nowrap">
                      {passage ? passage.citation : 'Corpus'}
                    </td>
                    <td className="py-3 px-3 text-[#c4c7c5] max-w-xs sm:max-w-sm leading-relaxed">
                      {ans.whatSourcesSay}
                    </td>
                    <td className="py-3 px-3 text-[#9aa0a6] max-w-xs leading-relaxed font-sans">
                      {ans.howItApplies}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
