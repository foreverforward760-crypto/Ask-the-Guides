import React, { useCallback, useState } from 'react';
import { AlertCircle, BookOpen, Check, Library, LockKeyhole, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { CouncilPicker } from './components/CouncilPicker.tsx';
import { QuestionBar } from './components/QuestionBar.tsx';
import { TraditionCard } from './components/TraditionCard.tsx';
import { CompareView } from './components/CompareView.tsx';
import { PassageDrawer } from './components/PassageDrawer.tsx';
import { AskResponse } from './types.ts';

const DEFAULT_WORKS = ['new_testament', 'marcus_aurelius', 'dhammapada', 'tao_te_ching', 'bhagavad_gita', 'quran'];
const CONSENT_KEY = 'ask-sources-consent-v2';

function CrisisPanel({ response }: { response: AskResponse }) {
  if (!response.crisis) return null;
  return <section className={`rounded-2xl border p-5 ${response.crisis.level === 'high' ? 'border-red-400/50 bg-red-950/35' : 'border-amber-300/40 bg-amber-950/25'}`}>
    <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-semibold text-[#f5ebd7]">Human support comes first</h2><p className="mt-1 text-sm leading-relaxed text-[#e6d9c2]">{response.crisis.message}</p><div className="mt-4 flex flex-wrap gap-2">{response.crisis.resources.map((resource) => <a className="rounded-xl bg-[#c99a4e] px-3 py-2 text-sm font-semibold text-[#17130d]" href={resource.href} target="_blank" rel="noreferrer" key={resource.href}>{resource.label}<span className="ml-2 font-normal opacity-75">{resource.detail}</span></a>)}</div></div></div>
  </section>;
}

export default function App() {
  const [selectedIds, setSelectedIds] = useState(DEFAULT_WORKS);
  const [question, setQuestion] = useState("I'm struggling to forgive someone who betrayed me");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'panels' | 'compare'>('panels');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [consented, setConsented] = useState(() => localStorage.getItem(CONSENT_KEY) === 'agreed');
  const [showConsent, setShowConsent] = useState(() => localStorage.getItem(CONSENT_KEY) !== 'agreed');

  const acceptConsent = async () => {
    try {
      setError(null);
      const result = await fetch('/api/consent', { method: 'POST' });
      const payload = await result.json();
      if (!result.ok || payload.ok !== true) {
        throw new Error(payload.error || 'Consent could not be recorded.');
      }
      localStorage.setItem(CONSENT_KEY, 'agreed');
      setConsented(true);
      setShowConsent(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Consent could not be recorded.');
    }
  };

  const revokeConsent = async () => {
    try {
      await fetch('/api/consent/revoke', { method: 'POST' });
    } catch {
      // Local revocation still clears the consent state if the server is unavailable.
    }
    localStorage.removeItem(CONSENT_KEY);
    setConsented(false);
    setShowConsent(true);
    setResponse(null);
  };

  const ask = useCallback(async (text: string, ids = selectedIds) => {
    if (!consented || !text.trim()) { setShowConsent(true); return; }
    setIsLoading(true); setError(null); setQuestion(text);
    try {
      const result = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text.trim(), traditionIds: ids, region: navigator.language.split('-')[1] || '' }) });
      const payload = await result.json();
      if (result.status === 403) {
        localStorage.removeItem(CONSENT_KEY);
        setConsented(false);
        setShowConsent(true);
      }
      if (!result.ok) throw new Error(payload.error || 'Unable to consult the sources.');
      setResponse(payload);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to consult the sources.'); }
    finally { setIsLoading(false); }
  }, [consented, selectedIds]);

  const changeWorks = (ids: string[]) => { setSelectedIds(ids); if (consented && question.trim()) ask(question, ids); };

  return <div className="min-h-screen bg-[#0f1115] text-[#e8eaed] selection:bg-[#c99a4e]/30">
    <Header viewMode={viewMode} onViewModeChange={setViewMode} selectedCount={selectedIds.length} onOpenLibrary={() => setLibraryOpen(true)} />
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#343443] bg-[radial-gradient(circle_at_top_right,rgba(201,154,78,.16),transparent_42%),linear-gradient(135deg,#191a22,#12141a)] p-6 sm:p-8">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-[#c99a4e]/10" /><div className="relative max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c99a4e]/25 bg-[#c99a4e]/10 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[.18em] text-[#e3bb78]"><BookOpen className="h-3.5 w-3.5" /> A reading room, not an oracle</div><h1 className="font-source-serif text-4xl leading-[.98] tracking-tight text-[#f5ebd7] sm:text-6xl">Bring a real question.<br /><span className="text-[#c99a4e]">Compare selected passages and interpretations.</span></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[#b8b8be] sm:text-base">Ask the Sources places a difficult question beside selected ancient and classical works. The passage is primary; the AI reading is labeled, limited, and never presented as doctrine.</p></div>
      </section>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#2b3040] bg-[#151820] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#c99a4e]" /><div><p className="text-sm font-semibold text-[#f5ebd7]">Three layers, kept distinct</p><p className="mt-1 text-xs leading-relaxed text-[#969ba5]">Passage · AI reading · Possible application. The prototype corpus is still editorial-review pending; citations, translations, and reuse rights have not all been independently verified.</p></div></div><button onClick={() => setShowConsent(true)} className="inline-flex shrink-0 items-center gap-2 text-xs text-[#d8b47a] hover:text-[#f3dfba]"><LockKeyhole className="h-3.5 w-3.5" /> Data consent</button></div>
      <QuestionBar onSubmit={(text) => ask(text)} isLoading={isLoading} activeQuestion={question} />
      <CouncilPicker selectedIds={selectedIds} onChange={changeWorks} />
      {response?.crisis && <CrisisPanel response={response} />}
      {error && <div className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200"><AlertCircle className="h-4 w-4" />{error}</div>}
      {response && !response.crisis && <><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262a34] pb-3"><div><span className="font-mono text-[11px] uppercase tracking-wider text-[#7e8490]">Consulting on</span><p className="mt-1 text-sm text-[#f5ebd7]">“{response.question}”</p></div><div className="flex items-center gap-3 text-xs text-[#7e8490]"><span>{response.quotaRemaining ?? '—'} asks left today</span><button title="Re-consult" onClick={() => ask(question)} className="rounded-lg p-1.5 hover:bg-[#202431] hover:text-white"><RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /></button></div></div>{response.noClosePassage ? <div className="rounded-2xl border border-[#343443] bg-[#151820] p-8 text-center"><Sparkles className="mx-auto h-6 w-6 text-[#c99a4e]" /><h2 className="mt-3 font-source-serif text-2xl text-[#f5ebd7]">No close passage found</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#969ba5]">The selected works do not contain a passage close enough to this question. Nothing has been padded or invented.</p></div> : viewMode === 'panels' ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{response.answers.map((answer) => <TraditionCard key={answer.traditionId} answer={answer} />)}</div> : <CompareView comparison={response.comparison} answers={response.answers} question={response.question} />}</>}
      <section className="grid gap-4 border-t border-[#232733] pt-6 text-xs text-[#858b95] sm:grid-cols-3"><div><p className="font-mono uppercase tracking-wider text-[#c99a4e]">Method</p><p className="mt-2 leading-relaxed">Retrieval happens before synthesis. The server supplies the passages; the client only displays them.</p></div><div><p className="font-mono uppercase tracking-wider text-[#c99a4e]">Limits</p><p className="mt-2 leading-relaxed">Educational reading tool. Not therapy, medical, legal, or religious counsel.</p></div><div><p className="font-mono uppercase tracking-wider text-[#c99a4e]">Library</p><button onClick={() => setLibraryOpen(true)} className="mt-2 inline-flex items-center gap-2 text-[#d8b47a] hover:text-[#f3dfba]"><Library className="h-3.5 w-3.5" />Browse the corpus</button></div></section>
    </main>
    <footer className="mt-10 border-t border-[#202530] bg-[#111317] py-6 text-center text-xs text-[#70757a]"><span className="font-cinzel text-sm text-[#a0a5ab]">Ask the Sources</span><span className="mx-2">—</span><span>A source-grounded reading room</span></footer>
    <PassageDrawer isOpen={libraryOpen} onClose={() => setLibraryOpen(false)} />
    {showConsent && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-lg rounded-3xl border border-[#45404a] bg-[#171922] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><div className="mb-3 inline-flex rounded-full border border-[#c99a4e]/25 bg-[#c99a4e]/10 p-2 text-[#d8b47a]"><LockKeyhole className="h-5 w-5" /></div><h2 className="font-source-serif text-3xl text-[#f5ebd7]">Before you ask</h2></div><button onClick={() => setShowConsent(false)} className="rounded-lg p-2 text-[#8b9099] hover:bg-[#242735]" aria-label="Close"><X className="h-4 w-4" /></button></div><p className="mt-4 text-sm leading-7 text-[#c9c7c6]">Your question and the selected passages are sent to Google Gemini for an AI-generated reading. The server enforces this consent token before accepting a question. Questions are not stored in an application database by this prototype. Google’s current API data terms govern provider-side handling; do not submit sensitive information.</p><p className="mt-3 text-xs leading-6 text-[#8f949e]">This is an educational reading tool, not therapy, medical, legal, or religious counsel. A keyword screen may flag some crisis language but can miss risk; it is not a safety assessment. Crisis resources are available without AI.</p><button onClick={acceptConsent} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c99a4e] px-4 py-3 text-sm font-semibold text-[#17130d] hover:bg-[#d8ab5f]"><Check className="h-4 w-4" />I agree and continue</button>{consented && <button onClick={revokeConsent} className="mt-3 w-full text-xs text-[#8f949e] hover:text-[#f3dfba]">Withdraw consent</button>}</div></div>}
  </div>;
}
