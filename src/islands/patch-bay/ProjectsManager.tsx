import React, { useState, useEffect } from 'preact/compat';
import DataTable from './DataTable';

type Project = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  githubUrl: string | null;
  liveUrl: string | null;
  tech: string[];
  displayOrder: number;
};

export default function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  return (
    <DataTable<Project>
      title="STORED_PROJECTS"
      initialItems={initialProjects}
      apiEndpoint="/api/projects"
      reorderTable="projects"
      columns={['ORD', 'TITLE', 'CATEGORY', 'STATUS']}
      renderRow={(project, idx, actions) => (
        <>
          <div className="w-12 text-center text-hw-text-muted font-mono text-[10px] flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={actions.onMoveUp} disabled={!actions.canMoveUp} className="hover:text-hw-accent-orange disabled:opacity-20">▲</button>
             <button onClick={actions.onMoveDown} disabled={!actions.canMoveDown} className="hover:text-hw-accent-orange disabled:opacity-20">▼</button>
          </div>
          <div className="flex-1 font-sans font-bold text-sm tracking-tight text-hw-text-main dark:text-[#ccc] dark:group-hover:text-[#00aaff] dark:group-hover:drop-shadow-[0_0_5px_rgba(0,170,255,0.8)] transition-all">{project.title}</div>
          <div className="flex-1 font-mono text-[10px] uppercase text-hw-text-muted">{project.category || 'N/A'}</div>
          <div className="flex-1">
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${project.status === 'PUBLISHED' ? 'border-hw-accent-blue text-hw-accent-blue bg-hw-accent-blue/10' : 'border-[#ff5500] text-[#ff5500] bg-[#ff5500]/10'}`}>
              {project.status}
            </span>
          </div>
          <div className="w-24 flex justify-end gap-2">
            <button onClick={actions.onEdit} className="hw-button">EDIT</button>
            <button onClick={actions.onDelete} className="hw-button hover:!text-red-500 hover:!border-red-500">DEL</button>
          </div>
        </>
      )}
      renderForm={({ onSave, onCancel, initialData }) => {
        const [title, setTitle] = useState(initialData?.title || '');
        const [category, setCategory] = useState(initialData?.category || 'Engineering');
        const [status, setStatus] = useState(initialData?.status || 'PUBLISHED');
        const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || '');
        const [description, setDescription] = useState(initialData?.description || '');
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Update local state if initialData changes
        useEffect(() => {
          if (initialData) {
            setTitle(initialData.title);
            setCategory(initialData.category || 'Engineering');
            setStatus(initialData.status);
            setGithubUrl(initialData.githubUrl || '');
            setDescription(initialData.description || '');
          }
        }, [initialData]);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          await onSave({ title, category, status, githubUrl, description });
          setIsSubmitting(false);
        };

        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Project Title" required value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} className="bg-hw-sticker dark:bg-[#0a0a0a] border border-hw-border dark:border-[#333] text-hw-text-main dark:text-[#00aaff] px-3 py-2 text-sm font-sans focus:border-hw-accent-orange dark:focus:border-[#00aaff] dark:focus:shadow-[0_0_10px_rgba(0,170,255,0.3)_inset] outline-none rounded-sm transition-all" />
              <input type="text" placeholder="Category" required value={category} onChange={(e) => setCategory((e.target as HTMLInputElement).value)} className="bg-hw-sticker dark:bg-[#0a0a0a] border border-hw-border dark:border-[#333] text-hw-text-main dark:text-[#00aaff] px-3 py-2 text-sm font-sans focus:border-hw-accent-orange dark:focus:border-[#00aaff] dark:focus:shadow-[0_0_10px_rgba(0,170,255,0.3)_inset] outline-none rounded-sm transition-all" />
              <select value={status} onChange={(e) => setStatus((e.target as HTMLInputElement).value)} className="bg-hw-sticker dark:bg-[#0a0a0a] border border-hw-border dark:border-[#333] text-hw-text-main dark:text-[#00aaff] px-3 py-2 text-sm font-sans focus:border-hw-accent-orange dark:focus:border-[#00aaff] dark:focus:shadow-[0_0_10px_rgba(0,170,255,0.3)_inset] outline-none rounded-sm transition-all">
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
            <input type="text" placeholder="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl((e.target as HTMLInputElement).value)} className="bg-hw-sticker dark:bg-[#0a0a0a] border border-hw-border dark:border-[#333] text-hw-text-main dark:text-[#00aaff] px-3 py-2 text-sm font-sans focus:border-hw-accent-orange dark:focus:border-[#00aaff] dark:focus:shadow-[0_0_10px_rgba(0,170,255,0.3)_inset] outline-none rounded-sm transition-all" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription((e.target as HTMLInputElement).value)} className="bg-hw-sticker dark:bg-[#0a0a0a] border border-hw-border dark:border-[#333] text-hw-text-main dark:text-[#00aaff] px-3 py-2 text-sm font-sans focus:border-hw-accent-orange dark:focus:border-[#00aaff] dark:focus:shadow-[0_0_10px_rgba(0,170,255,0.3)_inset] outline-none rounded-sm h-24 transition-all" />
            <div className="flex gap-3 justify-end mt-2">
              <button type="button" onClick={onCancel} className="hw-button">CANCEL</button>
              <button type="submit" disabled={isSubmitting} className="hw-button bg-[#111] text-white hover:bg-hw-accent-orange hover:text-white border-none">{isSubmitting ? 'SAVING...' : 'SAVE PROJECT'}</button>
            </div>
          </form>
        );
      }}
    />
  );
}
