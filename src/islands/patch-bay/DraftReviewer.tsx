import React, { useState, useEffect } from 'preact/compat';

type Draft = {
  id: string;
  repoFullName: string;
  title: string;
  description: string | null;
  tech: string[] | null;
  category: string | null;
  githubUrl: string | null;
  createdAt: string;
};

export default function DraftReviewer() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We fetch drafts dynamically so that it updates when the user runs the sync on the same page
  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json();
      setDrafts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    
    // Listen for sync completion to reload drafts
    const interval = setInterval(fetchDrafts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = (id: string, field: keyof Draft, value: any) => {
    setDrafts(drafts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleTechChange = (id: string, value: string) => {
    const techArray = value.split(',').map(t => t.trim()).filter(Boolean);
    handleUpdate(id, 'tech', techArray);
  };

  const handleDiscard = async (id: string) => {
    try {
      const res = await fetch('/api/drafts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setDrafts(drafts.filter(d => d.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (draft: Draft) => {
    try {
      const res = await fetch('/api/drafts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      if (res.ok) {
        setDrafts(drafts.filter(d => d.id !== draft.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-synth-text-muted font-mono opacity-50 p-4">
        <p className="text-center animate-pulse">&gt; FETCHING_DRAFTS...</p>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-synth-text-muted font-mono opacity-50 p-4">
        <p className="text-center">&gt; NO_DRAFTS_FOUND</p>
        <p className="text-[10px] mt-2 text-center uppercase">Initiate github sync to generate AI drafts</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
      <div className="text-xs text-hw-accent-orange font-mono tracking-widest border-b border-amber-900/50 pb-2">
        {drafts.length} DRAFT{drafts.length !== 1 ? 'S' : ''} PENDING REVIEW
      </div>

      {drafts.map(draft => (
        <div key={draft.id} className="flex flex-col gap-3 bg-hw-sticker border border-hw-border p-4 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-hw-text-muted font-mono">REPO: {draft.repoFullName}</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-hw-accent-blue font-mono uppercase tracking-widest">Title</label>
            <input 
              type="text" 
              value={draft.title}
              onChange={(e) => handleUpdate(draft.id, 'title', (e.target as HTMLInputElement).value)}
              className="bg-hw-bg border border-hw-border text-hw-text-main text-sm font-mono p-2 focus:border-hw-accent-blue outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-hw-accent-blue font-mono uppercase tracking-widest">Description</label>
            <textarea 
              value={draft.description || ''}
              onChange={(e) => handleUpdate(draft.id, 'description', (e.target as HTMLInputElement).value)}
              rows={3}
              className="bg-hw-bg border border-hw-border text-hw-text-muted text-xs font-mono p-2 focus:border-hw-accent-blue outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-hw-accent-blue font-mono uppercase tracking-widest">Tech Stack (comma separated)</label>
              <input 
                type="text" 
                value={(draft.tech || []).join(', ')}
                onChange={(e) => handleTechChange(draft.id, (e.target as HTMLInputElement).value)}
                className="bg-hw-bg border border-hw-border text-hw-text-muted text-xs font-mono p-2 focus:border-hw-accent-blue outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-hw-accent-blue font-mono uppercase tracking-widest">Category</label>
              <input 
                type="text" 
                value={draft.category || ''}
                onChange={(e) => handleUpdate(draft.id, 'category', (e.target as HTMLInputElement).value)}
                className="bg-hw-bg border border-hw-border text-hw-text-muted text-xs font-mono p-2 focus:border-hw-accent-blue outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-hw-border">
            <button 
              onClick={() => handleDiscard(draft.id)}
              className="hw-button hover:!text-red-500 hover:!border-red-500"
            >
              DISCARD
            </button>
            <button 
              onClick={() => handleApprove(draft)}
              className="hw-button !bg-[#111] !text-white hover:!bg-hw-accent-blue hover:!border-hw-accent-blue border-none"
            >
              APPROVE TO PORTFOLIO
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
