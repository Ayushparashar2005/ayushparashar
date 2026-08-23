import React, { useState, useEffect } from 'preact/compat';
import DataTable from './DataTable';

type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  displayOrder?: number;
};

export default function ExperienceManager({ initialExperience }: { initialExperience: Experience[] }) {
  return (
    <DataTable<Experience>
      title="WORK_EXPERIENCE"
      initialItems={initialExperience}
      apiEndpoint="/api/experience"
      reorderTable="experience"
      columns={['ORD', 'COMPANY & ROLE', 'DATES']}
      renderRow={(exp, idx, actions) => (
        <>
          <div className="w-12 text-center text-hw-text-muted font-mono text-[10px] flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={actions.onMoveUp} disabled={!actions.canMoveUp} className="hover:text-hw-accent-orange disabled:opacity-20">▲</button>
             <button onClick={actions.onMoveDown} disabled={!actions.canMoveDown} className="hover:text-hw-accent-orange disabled:opacity-20">▼</button>
          </div>
          <div className="flex-1 font-sans font-bold text-sm tracking-tight text-hw-text-main flex flex-col justify-center">
            {exp.company}
            <span className="font-mono text-[10px] uppercase text-hw-accent-blue font-normal">{exp.role}</span>
          </div>
          <div className="flex-1 font-mono text-[10px] text-hw-text-muted">
            {exp.startDate} — {exp.endDate || 'PRESENT'}
          </div>
          <div className="w-24 flex justify-end gap-2">
            <button onClick={actions.onEdit} className="hw-button">EDIT</button>
            <button onClick={actions.onDelete} className="hw-button hover:!text-red-500 hover:!border-red-500">DEL</button>
          </div>
        </>
      )}
      renderForm={({ onSave, onCancel, initialData }) => {
        const [company, setCompany] = useState(initialData?.company || '');
        const [role, setRole] = useState(initialData?.role || '');
        const [startDate, setStartDate] = useState(initialData?.startDate || '');
        const [endDate, setEndDate] = useState(initialData?.endDate || '');
        const [description, setDescription] = useState(initialData?.description || '');
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
          if (initialData) {
            setCompany(initialData.company);
            setRole(initialData.role);
            setStartDate(initialData.startDate);
            setEndDate(initialData.endDate || '');
            setDescription(initialData.description || '');
          }
        }, [initialData]);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          await onSave({ company, role, startDate, endDate: endDate || null, description });
          setIsSubmitting(false);
        };

        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Company" required value={company} onChange={(e) => setCompany((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
              <input type="text" placeholder="Role" required value={role} onChange={(e) => setRole((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
              <input type="text" placeholder="Start Date (e.g. Jun 2022)" required value={startDate} onChange={(e) => setStartDate((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
              <input type="text" placeholder="End Date (Leave blank for Present)" value={endDate} onChange={(e) => setEndDate((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
            </div>
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm h-24" />
            <div className="flex gap-3 justify-end mt-2">
              <button type="button" onClick={onCancel} className="hw-button">CANCEL</button>
              <button type="submit" disabled={isSubmitting} className="hw-button bg-[#111] text-white hover:bg-hw-accent-orange hover:text-white border-none">{isSubmitting ? 'SAVING...' : 'SAVE EXP'}</button>
            </div>
          </form>
        );
      }}
    />
  );
}
