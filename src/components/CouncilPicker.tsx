import React, { useState } from 'react';
import { TRADITIONS } from '../lib/sources.ts';
import { TraditionGroupId, TraditionMetadata } from '../types.ts';
import { Check, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface CouncilPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const CouncilPicker: React.FC<CouncilPickerProps> = ({ selectedIds, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group traditions by TraditionGroupId
  const grouped = TRADITIONS.reduce((acc, trad) => {
    if (!acc[trad.group]) acc[trad.group] = [];
    acc[trad.group].push(trad);
    return acc;
  }, {} as Record<TraditionGroupId, TraditionMetadata[]>);

  const groupOrder: TraditionGroupId[] = [
    'Stoicism',
    'Buddhism',
    'Christianity',
    'Judaism',
    'Islam',
    'East Asian',
    'Hindu & Dharmic',
    'Classical Philosophy',
    'African Spirituality',
    'Modern Philosophy',
  ];

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        onChange(selectedIds.filter((item) => item !== id));
      }
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const applyPreset = (preset: 'all' | 'ten' | 'stoic' | 'abrahamic' | 'eastern') => {
    switch (preset) {
      case 'all':
        onChange(TRADITIONS.map((t) => t.id));
        break;
      case 'ten':
        // The 10 core traditions highlighted in prompt
        onChange([
          'new_testament',
          'old_testament',
          'marcus_aurelius',
          'epictetus',
          'seneca',
          'dhammapada',
          'tao_te_ching',
          'analects',
          'bhagavad_gita',
          'quran',
        ]);
        break;
      case 'stoic':
        onChange(['marcus_aurelius', 'epictetus', 'seneca', 'classical_philosophy']);
        break;
      case 'abrahamic':
        onChange(['new_testament', 'old_testament', 'quran']);
        break;
      case 'eastern':
        onChange(['dhammapada', 'tao_te_ching', 'analects', 'bhagavad_gita']);
        break;
    }
  };

  return (
    <div className="bg-[#14171f] border border-[#262c38] rounded-xl overflow-hidden transition-all shadow-md">
      {/* Header bar */}
      <div className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-[#181c25]/80 border-b border-[#232833]">
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-[#c99a4e]" />
          <h2 className="text-sm font-semibold tracking-wide text-[#e8eaed] font-cinzel">
            Choose Your Council
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#c99a4e]/20 text-[#f5d79e] font-mono border border-[#c99a4e]/30">
            {selectedIds.length} of {TRADITIONS.length} active
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-[#80868b] mr-1 hidden sm:inline">Presets:</span>
          <button
            onClick={() => applyPreset('ten')}
            className="px-2.5 py-1 rounded bg-[#1f242f] text-[#d2d6dc] hover:text-[#c99a4e] hover:bg-[#282f3d] transition-colors border border-[#2d3444]"
          >
            10 Core
          </button>
          <button
            onClick={() => applyPreset('stoic')}
            className="px-2.5 py-1 rounded bg-[#1f242f] text-[#d2d6dc] hover:text-[#c99a4e] hover:bg-[#282f3d] transition-colors border border-[#2d3444]"
          >
            Stoics
          </button>
          <button
            onClick={() => applyPreset('abrahamic')}
            className="px-2.5 py-1 rounded bg-[#1f242f] text-[#d2d6dc] hover:text-[#c99a4e] hover:bg-[#282f3d] transition-colors border border-[#2d3444]"
          >
            Abrahamic
          </button>
          <button
            onClick={() => applyPreset('eastern')}
            className="px-2.5 py-1 rounded bg-[#1f242f] text-[#d2d6dc] hover:text-[#c99a4e] hover:bg-[#282f3d] transition-colors border border-[#2d3444]"
          >
            Eastern
          </button>
          <button
            onClick={() => applyPreset('all')}
            className="px-2.5 py-1 rounded bg-[#1f242f] text-[#d2d6dc] hover:text-[#c99a4e] hover:bg-[#282f3d] transition-colors border border-[#2d3444]"
          >
            All
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 p-1 text-[#9aa0a6] hover:text-[#e8eaed] rounded transition-colors"
            title={isExpanded ? 'Collapse council picker' : 'Expand council picker'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grouped Picker Body */}
      <div className={`p-4 sm:p-5 ${isExpanded ? 'block' : 'block'} transition-all`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {groupOrder.map((groupKey) => {
            const traditionsInGroup = grouped[groupKey];
            if (!traditionsInGroup || traditionsInGroup.length === 0) return null;

            return (
              <div
                key={groupKey}
                className="bg-[#101217] rounded-lg p-3 border border-[#202530] flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-[#8ab4f8] mb-2 font-medium flex items-center justify-between">
                    <span>{groupKey}</span>
                  </div>

                  <div className="space-y-1.5">
                    {traditionsInGroup.map((trad) => {
                      const isSelected = selectedIds.includes(trad.id);
                      return (
                        <button
                          key={trad.id}
                          id={`council-toggle-${trad.id}`}
                          onClick={() => handleToggle(trad.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-all border ${
                            isSelected
                              ? 'bg-[#1e2330] border-[#3b475e] text-[#f1f3f5] font-medium shadow-sm'
                              : 'bg-transparent border-transparent text-[#70757a] hover:text-[#9aa0a6] hover:bg-[#161920]'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-1">
                            <span className="truncate">{trad.name}</span>
                            <span className="text-[10px] text-[#80868b] font-mono truncate">
                              {trad.sourceWork}
                            </span>
                          </div>

                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                              isSelected
                                ? 'bg-[#c99a4e] border-[#c99a4e] text-[#0f1115]'
                                : 'border-[#3c4043] bg-[#12151b]'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
