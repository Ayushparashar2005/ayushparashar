import { useState } from 'preact/hooks';

export default function SyncControl() {
  const [githubStatus, setGithubStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [youtubeStatus, setYoutubeStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async (provider: 'github' | 'youtube') => {
    const setStatus = provider === 'github' ? setGithubStatus : setYoutubeStatus;
    setStatus('syncing');
    setMessage(`Initiating ${provider.toUpperCase()} sync sequence...`);

    try {
      const res = await fetch(`/api/${provider}/sync`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(`SUCCESS: ${provider.toUpperCase()} synced. ${provider === 'github' ? 'Drafts created.' : 'Videos synced.'}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(`ERROR: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full text-hw-text-main font-mono">
      <div className="flex justify-between items-center bg-hw-sticker p-3 border border-hw-border rounded-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col">
            <span className="text-[10px] text-hw-text-muted">DATA_SOURCE</span>
            <span className="text-sm">GITHUB_REPOS</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${githubStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : githubStatus === 'success' ? 'bg-hw-accent-blue' : githubStatus === 'error' ? 'bg-red-500' : 'bg-hw-border'}`}></div>
               <span className="text-[8px] text-hw-text-muted uppercase">{githubStatus}</span>
            </div>
            <button 
              onClick={() => handleSync('github')}
              disabled={githubStatus === 'syncing'}
              className="hw-button"
            >
              [ SYNC ]
            </button>
         </div>
      </div>

      <div className="flex justify-between items-center bg-hw-sticker p-3 border border-hw-border rounded-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
         <div className="flex flex-col">
            <span className="text-[10px] text-hw-text-muted">DATA_SOURCE</span>
            <span className="text-sm">YOUTUBE_UPLOADS</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${youtubeStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : youtubeStatus === 'success' ? 'bg-hw-accent-blue' : youtubeStatus === 'error' ? 'bg-red-500' : 'bg-hw-border'}`}></div>
               <span className="text-[8px] text-hw-text-muted uppercase">{youtubeStatus}</span>
            </div>
            <button 
              onClick={() => handleSync('youtube')}
              disabled={youtubeStatus === 'syncing'}
              className="hw-button"
            >
              [ SYNC ]
            </button>
         </div>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-hw-bg border border-hw-border rounded-sm text-[10px] text-hw-accent-blue break-words">
          &gt; {message}
        </div>
      )}
    </div>
  );
}
