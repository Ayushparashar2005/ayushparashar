import React, { useState } from 'preact/compat';

type Video = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  publishedAt: Date | string;
  status: string;
};

type Playlist = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
};

export default function MediaRouter({ 
  initialVideos, 
  initialPlaylists 
}: { 
  initialVideos: Video[], 
  initialPlaylists: Playlist[] 
}) {
  const [activeTab, setActiveTab] = useState<'videos' | 'playlists'>('videos');

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 md:p-6 gap-6 min-h-0">
      
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center border-b-2 border-hw-border pb-4 shrink-0 gap-4">
        <div>
          <div className="text-[10px] font-sans font-bold text-hw-text-muted tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hw-accent-orange animate-pulse shadow-[0_0_5px_rgba(255,85,0,0.6)]"></span>
            YT_API_CONNECTION
          </div>
          <div className="text-lg font-sans font-bold text-hw-text-main mt-1 tracking-wider uppercase">VOYXGE // MEDIA</div>
        </div>
        
        <div className="flex gap-4 bg-hw-module-inset p-2 rounded border-2 border-hw-border shadow-inner">
           <button 
             onClick={() => setActiveTab('videos')}
             className={`text-[10px] px-6 py-2 tracking-widest font-bold rounded shadow-sm border transition-all flex items-center gap-2 relative overflow-hidden ${
               activeTab === 'videos' 
                 ? 'border-hw-accent-orange bg-[#2a1100] text-hw-accent-orange shadow-[inset_0_0_8px_rgba(255,85,0,0.3)]' 
                 : 'border-hw-screw-border bg-hw-module text-hw-text-muted hover:bg-hw-sticker'
             }`}
           >
              <div className={`w-1.5 h-1.5 rounded-full pointer-events-none indicator-led ${activeTab === 'videos' ? 'bg-hw-accent-orange shadow-[0_0_8px_rgba(255,85,0,0.9)]' : 'bg-hw-screw shadow-inner'}`}></div>
              <span className="pointer-events-none relative z-10">VIDEOS</span>
           </button>
           <button 
             onClick={() => setActiveTab('playlists')}
             className={`text-[10px] px-6 py-2 tracking-widest font-bold rounded shadow-sm border transition-all flex items-center gap-2 relative overflow-hidden ${
               activeTab === 'playlists' 
                 ? 'border-hw-accent-blue bg-[#00112a] text-hw-accent-blue shadow-[inset_0_0_8px_rgba(0,170,255,0.3)]' 
                 : 'border-hw-screw-border bg-hw-module text-hw-text-muted hover:bg-hw-sticker'
             }`}
           >
              <div className={`w-1.5 h-1.5 rounded-full pointer-events-none indicator-led ${activeTab === 'playlists' ? 'bg-hw-accent-blue shadow-[0_0_8px_rgba(0,170,255,0.9)]' : 'bg-hw-screw shadow-inner'}`}></div>
              <span className="pointer-events-none relative z-10">PLAYLISTS</span>
           </button>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <a href="https://www.youtube.com/channel/UCTWZFNloPx0rNAd8Dhesdqg" target="_blank" rel="noreferrer" className="hw-button w-full md:w-auto h-10 px-6 flex items-center justify-center font-bold text-white bg-hw-accent-orange hover:bg-[#e64a00] border-hw-accent-orange shadow-[0_4px_0_#cc4400,0_5px_5px_rgba(0,0,0,0.3)] active:shadow-[0_0px_0_#cc4400,0_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 transition-all text-xs tracking-widest uppercase rounded">
            SUBSCRIBE
          </a>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar min-h-0 pr-2">
        {activeTab === 'videos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialVideos.map(video => (
              <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" className="group flex flex-col gap-2 bg-hw-module-inset border-2 border-hw-border p-4 rounded-lg shadow-sm relative shrink-0 hover:bg-hw-module transition-colors">
                {/* Screws */}
                <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-hw-screw shadow-inner border border-hw-screw-border"></div>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-hw-screw shadow-inner border border-hw-screw-border"></div>
                
                {/* Indicator Label */}
                <div className="absolute top-0 right-6 bg-hw-sticker border-x border-b border-hw-border text-hw-accent-orange text-[8px] font-mono font-bold px-2 py-0.5 rounded-b shadow-sm z-20 uppercase tracking-widest">
                   {video.status}
                </div>

                {/* CRT Screen for Thumbnail */}
                <div className="relative w-full aspect-video overflow-hidden rounded bg-hw-screen border-4 border-hw-border-screen shadow-[inset_0_0_10px_rgba(0,0,0,1)] group-hover:border-hw-border transition-colors mt-3">
                  {/* Scanlines */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] opacity-50 z-20 pointer-events-none mix-blend-overlay"></div>
                  <img 
                    src={video.thumbnailUrl || ''} 
                    alt={video.title} 
                    className="w-full h-full object-cover filter grayscale contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 relative z-10" 
                    loading="lazy" 
                  />
                  <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
                     <span className="text-[8px] font-mono font-bold text-red-500 tracking-widest bg-black/50 px-1 rounded">PLAY</span>
                  </div>
                </div>
                
                {/* Label Sticker */}
                <div className="bg-hw-sticker border border-hw-border p-3 mt-1 shadow-sm rounded-sm relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-hw-sticker border-l border-hw-border flex items-center justify-center pointer-events-none z-10">
                     <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTAgMGgxdjEwMEgwek0yIDBoMXYxMDBIMnpNNCAwaDJ2MTAwSDR6TTcgMGgxdjEwMEg3eiIgZmlsbD0iIzIyMiIvPjwvc3ZnPg==')] opacity-20"></div>
                  </div>
                  
                  <h3 className="text-xs font-mono font-bold text-hw-text-main leading-snug line-clamp-2 uppercase tracking-wide pr-6 relative z-10 group-hover:text-hw-accent-orange transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex justify-between items-end mt-2 border-t border-dashed border-hw-border pt-2 pr-6 relative z-10">
                    <span className="text-[9px] font-mono font-bold text-hw-text-muted">ID: {video.id}</span>
                    <span className="text-[8px] font-mono font-bold text-hw-screen-light bg-hw-module border border-hw-border px-1 shadow-inner">[{formatDate(video.publishedAt)}]</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPlaylists.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-hw-border text-hw-text-muted font-sans font-bold text-xs bg-hw-module rounded-md shadow-inner">
                NO PLAYLISTS FOUND.
              </div>
            ) : (
              initialPlaylists.map(playlist => (
                <a key={playlist.id} href={`https://www.youtube.com/playlist?list=${playlist.id}`} target="_blank" rel="noreferrer" className="group flex flex-col gap-2 bg-hw-module-inset border-2 border-hw-border p-4 rounded-lg shadow-sm relative shrink-0 hover:bg-hw-module transition-colors">
                  {/* Screws */}
                  <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-hw-screw shadow-inner border border-hw-screw-border"></div>
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-hw-screw shadow-inner border border-hw-screw-border"></div>
                  
                  {/* Indicator Label */}
                  <div className="absolute top-0 right-6 bg-hw-sticker border-x border-b border-hw-border text-hw-accent-blue text-[8px] font-mono font-bold px-2 py-0.5 rounded-b shadow-sm z-20 uppercase tracking-widest">
                     COLLECTION
                  </div>

                  {/* CRT Screen for Thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden rounded bg-hw-screen border-4 border-hw-border-screen shadow-[inset_0_0_10px_rgba(0,0,0,1)] group-hover:border-hw-border transition-colors mt-3">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] opacity-50 z-20 pointer-events-none mix-blend-overlay"></div>
                    <img 
                      src={playlist.thumbnailUrl || ''} 
                      alt={playlist.title} 
                      className="w-full h-full object-cover filter grayscale contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 relative z-10 blur-[1px] group-hover:blur-0" 
                      loading="lazy" 
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 transition-opacity z-20 pointer-events-none">
                      <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                      <span className="text-white font-sans text-xs font-bold tracking-widest uppercase">PLAYLIST</span>
                    </div>
                  </div>
                  
                  {/* Label Sticker */}
                  <div className="bg-hw-sticker border border-hw-border p-3 mt-1 shadow-sm rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-hw-sticker border-l border-hw-border flex items-center justify-center pointer-events-none z-10">
                       <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTAgMGgxdjEwMEgwek0yIDBoMXYxMDBIMnpNNCAwaDJ2MTAwSDR6TTcgMGgxdjEwMEg3eiIgZmlsbD0iIzIyMiIvPjwvc3ZnPg==')] opacity-20"></div>
                    </div>
                    
                    <h3 className="text-xs font-mono font-bold text-hw-text-main leading-snug line-clamp-2 uppercase tracking-wide pr-6 relative z-10 group-hover:text-hw-accent-blue transition-colors">
                      {playlist.title}
                    </h3>
                    <div className="flex justify-between items-end mt-2 border-t border-dashed border-hw-border pt-2 pr-6 relative z-10">
                      <span className="text-[9px] font-mono font-bold text-hw-text-muted">ID: {playlist.id}</span>
                      <span className="text-[8px] font-mono font-bold text-hw-screen-light bg-hw-module border border-hw-border px-1 shadow-inner">[MULTIPLE_ITEMS]</span>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
