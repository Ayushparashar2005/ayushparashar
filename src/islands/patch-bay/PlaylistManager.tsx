import React, { useState, useEffect } from 'preact/compat';
import DataTable from './DataTable';

type Playlist = {
  id: string; // YouTube Playlist ID
  title: string;
  thumbnailUrl: string | null;
  displayOrder?: number;
};

export default function PlaylistManager({ initialPlaylists }: { initialPlaylists: Playlist[] }) {
  return (
    <DataTable<Playlist>
      title="YOUTUBE_PLAYLISTS"
      initialItems={initialPlaylists}
      apiEndpoint="/api/playlists"
      reorderTable="youtubePlaylists"
      columns={['ORD', 'PLAYLIST', 'ID']}
      renderRow={(playlist, idx, actions) => (
        <>
          <div className="w-12 text-center text-hw-text-muted font-mono text-[10px] flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={actions.onMoveUp} disabled={!actions.canMoveUp} className="hover:text-hw-accent-orange disabled:opacity-20">▲</button>
             <button onClick={actions.onMoveDown} disabled={!actions.canMoveDown} className="hover:text-hw-accent-orange disabled:opacity-20">▼</button>
          </div>
          <div className="flex-1 font-sans font-bold text-sm tracking-tight text-hw-text-main flex items-center gap-3">
            {playlist.thumbnailUrl ? (
              <img src={playlist.thumbnailUrl} alt="thumbnail" className="w-8 h-8 object-cover rounded opacity-80" />
            ) : null}
            {playlist.title}
          </div>
          <div className="flex-1 font-mono text-[10px] text-hw-accent-blue">{playlist.id}</div>
          <div className="w-24 flex justify-end gap-2">
            <button onClick={actions.onEdit} className="hw-button">EDIT</button>
            <button onClick={actions.onDelete} className="hw-button hover:!text-red-500 hover:!border-red-500">DEL</button>
          </div>
        </>
      )}
      renderForm={({ onSave, onCancel, initialData }) => {
        const [id, setId] = useState(initialData?.id || '');
        const [title, setTitle] = useState(initialData?.title || '');
        const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
          if (initialData) {
            setId(initialData.id);
            setTitle(initialData.title);
            setThumbnailUrl(initialData.thumbnailUrl || '');
          }
        }, [initialData]);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          await onSave({ id, title, thumbnailUrl });
          setIsSubmitting(false);
        };

        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="YouTube Playlist ID" required value={id} onChange={(e) => setId((e.target as HTMLInputElement).value)} disabled={!!initialData?.id} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm disabled:opacity-50" />
              <input type="text" placeholder="Playlist Title" required value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
            </div>
            <input type="text" placeholder="Thumbnail URL (Optional)" value={thumbnailUrl} onChange={(e) => setThumbnailUrl((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
            <div className="flex gap-3 justify-end mt-2">
              <button type="button" onClick={onCancel} className="hw-button">CANCEL</button>
              <button type="submit" disabled={isSubmitting} className="hw-button bg-[#111] text-white hover:bg-hw-accent-orange hover:text-white border-none">{isSubmitting ? 'SAVING...' : 'SAVE PLAYLIST'}</button>
            </div>
          </form>
        );
      }}
    />
  );
}
