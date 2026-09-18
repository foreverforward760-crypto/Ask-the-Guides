import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { CouncilPicker } from './components/CouncilPicker.tsx';
import { QuestionBar } from './components/QuestionBar.tsx';
import { TraditionCard } from './components/TraditionCard.tsx';
import { CompareView } from './components/CompareView.tsx';
import { PassageDrawer } from './components/PassageDrawer.tsx';
import { AskResponse, TraditionGroupId } from './types.ts';
import { Sparkles, ShieldCheck, Layers, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { TRADITIONS } from './lib/sources.ts';
import { retrievePassagesForTraditions } from './lib/retrieve.ts';
import { generateLocalGroundedInterpretation, generateLocalComparison } from './lib/ai.ts';

const DEFAULT_COUNCIL = [
  'new_testament',
  'marcus_aurelius',
  'dhammapada',
  'tao_te_ching',
  'bhagavad_gita',
  'quran',
];

export default function App() {
  const [selectedTraditionIds, setSelectedTraditionIds] = useState<string[]>(DEFAULT_COUNCIL);
  const [question, setQuestion] = useState<string>("I'm struggling to forgive someone who betrayed me");
  const [activeResponse, setActiveResponse] = useState<AskResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'panels' | 'compare'>('panels');
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  // Client-side fallback generator to ensure absolute reliability even during dev server cold start
  const generateClientFallbackResponse = useCallback(
    (q: string, traditionIds: string[]): AskResponse => {
      const retrieval = retrievePassagesForTraditions(q, traditionIds, 2);
      const councilPassages = traditionIds
        .map((tid) => {
          const tradition = TRADITIONS.find((t) => t.id === tid);
          const passages = retrieval.passagesByTradition[tid] || [];
          if (!tradition || passages.length === 0) return null;
          return { tradition, passages };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const answers = councilPassages.map(({ tradition, passages }) => {
        const local = generateLocalGroundedInterpretation(q, tradition, passages);
        return {
          traditionId: tradition.id,
          traditionName: tradition.name,
          group: tradition.group as TraditionGroupId,
          color: tradition.accentColor,
          passages,
          whatSourcesSay: local.whatSourcesSay,
          howItApplies: local.howItApplies,
        };
      });

      const comparison = generateLocalComparison(answers);

      return {
        question: q,
        detectedThemes: retrieval.detectedThemes,
        answers,
        comparison,
      };
    },
    []
  );

  const handleAsk = useCallback(
    async (queryText: string, councilIds: string[] = selectedTraditionIds) => {
      if (!queryText.trim()) return;

      setIsLoading(true);
      setError(null);
      setQuestion(queryText);

      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: queryText,
            traditionIds: councilIds,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }

        const data: AskResponse = await res.json();
        setActiveResponse(data);
      } catch (err: any) {
        console.warn('API route call not responding, utilizing grounded source engine client fallback:', err);
        // Fallback to grounded local synthesis
        const fallbackData = generateClientFallbackResponse(queryText, councilIds);
        setActiveResponse(fallbackData);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTraditionIds, generateClientFallbackResponse]
  );

  // Initial consult on app mount
  useEffect(() => {
    handleAsk("I'm struggling to forgive someone who betrayed me", DEFAULT_COUNCIL);
  }, [handleAsk]);

  // When council changes, re-query with current question if present
  const handleCouncilChange = (newIds: string[]) => {
    setSelectedTraditionIds(newIds);
    if (question.trim()) {
      handleAsk(question, newIds);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e8eaed] flex flex-col selection:bg-[#c99a4e]/30 selection:text-[#f3dfba]">
      {/* Navigation Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedTraditionIds.length}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Core Philosophy Banner */}
        <div className="bg-gradient-to-r from-[#181c25] via-[#14171f] to-[#181c25] border border-[#262c3b] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c99a4e]/10 text-[#c99a4e] border border-[#c99a4e]/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold text-[#f5ebd7]">
                  The Source-Grounded Principle
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#202533] text-[#8ab4f8] border border-[#2b3346]">
                  3 Distinct Layers
                </span>
              </div>
              <p className="text-xs text-[#9aa0a6] mt-0.5 leading-relaxed">
                You always know where the text ends and the interpretation begins: <span className="text-[#f3dfba] font-serif-reader">1. The Passages Themselves</span> → <span className="text-[#8ab4f8]">2. What the Sources Say</span> → <span className="text-[#6ee7b7]">3. How It Applies</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#80868b] font-mono shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#c99a4e]" />
            <span>Never blended · Accredited translations</span>
          </div>
        </div>

        {/* Question Search & Prompt Bar */}
        <QuestionBar
          onSubmit={(q) => handleAsk(q)}
          isLoading={isLoading}
          activeQuestion={question}
        />

        {/* Council Selection Picker */}
        <CouncilPicker
          selectedIds={selectedTraditionIds}
          onChange={handleCouncilChange}
        />

        {/* Status Bar / Active Query & Detected Themes */}
        {activeResponse && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-b border-[#212633]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-[#80868b]">Consulting on:</span>
              <span className="text-sm font-semibold text-[#f5ebd7] font-sans">
                "{activeResponse.question}"
              </span>

              {activeResponse.detectedThemes && activeResponse.detectedThemes.length > 0 && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-[#70757a] font-mono">Themes:</span>
                  {activeResponse.detectedThemes.map((th) => (
                    <span
                      key={th}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1b202c] text-[#8ab4f8] border border-[#2d374a]"
                    >
                      #{th}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-[#80868b] flex items-center gap-2">
              <span>{activeResponse.answers.length} tradition answers</span>
              <button
                onClick={() => handleAsk(question)}
                disabled={isLoading}
                className="p-1 text-[#9aa0a6] hover:text-[#e8eaed] rounded transition-colors"
                title="Re-consult the sources"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Error Notification if any */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Response View: Panels vs Compare Mode */}
        {activeResponse && (
          <div className="mt-4">
            {viewMode === 'panels' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {activeResponse.answers.map((answer) => (
                  <TraditionCard key={answer.traditionId} answer={answer} />
                ))}
              </div>
            ) : (
              <CompareView
                comparison={activeResponse.comparison}
                answers={activeResponse.answers}
                question={activeResponse.question}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#202530] bg-[#111317] py-6 mt-12 text-center text-xs text-[#70757a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm text-[#a0a5ab] font-semibold">
              Ask the Sources
            </span>
            <span>—</span>
            <span>Source-grounded comparative wisdom engine</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Primary Corpus: 10 Core Traditions</span>
            <span>·</span>
            <span>45+ Tagged Passages</span>
          </div>
        </div>
      </footer>

      {/* Primary Sources Corpus Drawer */}
      <PassageDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />
    </div>
  );
}
