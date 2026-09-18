import React from 'react';
import { BookOpen, Sparkles, SlidersHorizontal, Library } from 'lucide-react';

interface HeaderProps {
  viewMode: 'panels' | 'compare';
  onViewModeChange: (mode: 'panels' | 'compare') => void;
  selectedCount: number;
  onOpenLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  selectedCount,
  onOpenLibrary,
}) => {
  return (
    <header className="border-b border-[#232730] bg-[#111318]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#c99a4e]/10 border border-[#c99a4e]/30 flex items-center justify-center text-[#c99a4e] shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-[#f5ebd7]">
                  Ask the Sources
                </h1>
                <span className="hidden md:inline-block text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-[#c99a4e]/15 text-[#e5be79] border border-[#c99a4e]/30">
                  Wisdom Engine
                </span>
              </div>
              <p className="text-xs text-[#9aa0a6] hidden sm:block">
                Source-grounded comparative dialogue across world traditions
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLibrary}
            className="sm:hidden flex items-center gap-1.5 text-xs text-[#c99a4e] hover:text-[#f3dfba] px-2.5 py-1 rounded border border-[#c99a4e]/30 bg-[#c99a4e]/10"
            title="Browse all 45+ source passages"
          >
            <Library className="w-3.5 h-3.5" />
            <span>Corpus</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenLibrary}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#c99a4e] hover:text-[#f3dfba] px-3 py-1.5 rounded-lg border border-[#c99a4e]/30 bg-[#c99a4e]/10 hover:bg-[#c99a4e]/20 transition-colors"
            title="Browse all 45+ source passages in the library"
          >
            <Library className="w-4 h-4" />
            <span className="font-medium">Browse Library</span>
            <span className="text-[10px] opacity-75 font-mono">(45+ texts)</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#181b22] border border-[#2d3340] p-0.5 rounded-lg text-xs">
            <button
              id="view-mode-panels"
              onClick={() => onViewModeChange('panels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'panels'
                  ? 'bg-[#c99a4e] text-[#0f1115] shadow-sm font-semibold'
                  : 'text-[#9aa0a6] hover:text-[#e8eaed]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Council Panels</span>
            </button>
            <button
              id="view-mode-compare"
              onClick={() => onViewModeChange('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'compare'
                  ? 'bg-[#c99a4e] text-[#0f1115] shadow-sm font-semibold'
                  : 'text-[#9aa0a6] hover:text-[#e8eaed]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compare Mode</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
