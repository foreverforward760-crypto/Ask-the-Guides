import React, { useState, useMemo } from 'react';
import { PASSAGES, TRADITIONS } from '../lib/sources.ts';
import { Passage } from '../types.ts';
import { X, Search, BookOpen, Quote, Tag } from 'lucide-react';

interface PassageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestionTheme?: (theme: string) => void;
}

export const PassageDrawer: React.FC<PassageDrawerProps> = ({
  isOpen,
  onClose,
  onSelectQuestionTheme,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTradition, setSelectedTradition] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const allThemes = useMemo(() => {
    const set = new Set<string>();
    PASSAGES.forEach((p) => p.themes.forEach((th) => set.add(th)));
    return Array.from(set).sort();
  }, []);

  const filteredPassages = useMemo(() => {
    return PASSAGES.filter((p) => {
      if (selectedTradition !== 'all' && p.traditionId !== selectedTradition) {
        return false;
      }
      if (selectedTheme !== 'all' && !p.themes.includes(selectedTheme)) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesText = p.text.toLowerCase().includes(query);
        const matchesCitation = p.citation.toLowerCase().includes(query);
        const matchesAuthor = p.author.toLowerCase().includes(query);
        const matchesTranslator = p.translator.toLowerCase().includes(query);
        const matchesTheme = p.themes.some((t) => t.toLowerCase().includes(query));
        return matchesText || matchesCitation || matchesAuthor || matchesTranslator || matchesTheme;
      }
      return true;
    });
  }, [search, selectedTradition, selectedTheme]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12151b] border border-[#2d3444] rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#232833] flex items-center justify-between bg-[#151922]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#c99a4e]" />
            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#f5ebd7]">
                Prototype Passage Library
              </h3>
              <p className="text-xs text-[#9aa0a6]">
                {PASSAGES.length} entered excerpts; text, citations, translations, editions, and reuse rights require editorial verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#1f2430] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-[#14171f] border-b border-[#202530] flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#80868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, author, or passage..."
              className="w-full bg-[#181c25] border border-[#2b3342] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#e8eaed] placeholder-[#70757a] focus:outline-none focus:border-[#c99a4e]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value)}
              className="bg-[#181c25] border border-[#2b3342] text-xs text-[#d2d6dc] rounded-xl px-3 py-2 focus:outline-none focus:border-[#c99a4e]"
            >
              <option value="all">All Traditions ({TRADITIONS.length})</option>
              {TRADITIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="bg-[#181c25] border border-[#2b3342] text-xs text-[#d2d6dc] rounded-xl px-3 py-2 focus:outline-none focus:border-[#c99a4e]"
            >
              <option value="all">All Themes ({allThemes.length})</option>
              {allThemes.map((th) => (
                <option key={th} value={th}>
                  {th.charAt(0).toUpperCase() + th.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Passages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="text-xs text-[#80868b] font-mono">
            Showing {filteredPassages.length} of {PASSAGES.length} passages
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPassages.map((passage) => (
              <div
                key={passage.id}
                className="bg-[#161a22] border border-[#262c3a] rounded-xl p-4 flex flex-col justify-between hover:border-[#3b4559] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#212633]">
                    <span className="font-bold text-[#f5ebd7] font-serif-reader text-sm">
                      {passage.citation}
                    </span>
                    <span className="text-[11px] font-mono text-[#8ab4f8]">
                      {passage.traditionName}
                    </span>
                  </div>

                  <p className="text-xs text-[#a0a5ab] mb-2 font-medium">
                    {passage.author} · <span className="italic">{passage.work}</span>
                  </p>

                  <blockquote className="font-source-serif italic text-[#f3dfba] text-sm leading-relaxed my-2 pl-3 border-l-2 border-[#c99a4e]/60">
                    "{passage.text}"
                  </blockquote>

                  {passage.contextNote && (
                    <div className="text-[11px] text-[#9aa0a6] bg-[#12151c] p-2 rounded border border-[#202530] my-2 font-sans">
                      <span className="text-[#c99a4e] font-mono mr-1">Context:</span>
                      {passage.contextNote}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#202530] space-y-2">
                  <div className="flex flex-wrap items-center justify-between text-[10px] text-[#80868b] font-mono gap-1">
                    <span>Translator listed: {passage.translator}</span>
                    <span className="italic">Edition listed: {passage.edition}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {passage.themes.map((th) => (
                      <span
                        key={th}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c222e] text-[#b3c5e6] font-mono"
                      >
                        #{th}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
