import React, { useState, useEffect } from 'preact/compat';
import DataTable from './DataTable';

type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  displayOrder?: number;
};

export default function SkillsManager({ initialSkills }: { initialSkills: Skill[] }) {
  return (
    <DataTable<Skill>
      title="TECHNICAL_SKILLS"
      initialItems={initialSkills}
      apiEndpoint="/api/skills"
      reorderTable="skills"
      columns={['ORD', 'SKILL', 'PROFICIENCY']}
      renderRow={(skill, idx, actions) => (
        <>
          <div className="w-12 text-center text-hw-text-muted font-mono text-[10px] flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={actions.onMoveUp} disabled={!actions.canMoveUp} className="hover:text-hw-accent-orange disabled:opacity-20">▲</button>
             <button onClick={actions.onMoveDown} disabled={!actions.canMoveDown} className="hover:text-hw-accent-orange disabled:opacity-20">▼</button>
          </div>
          <div className="flex-1 font-sans font-bold text-sm tracking-tight text-hw-text-main flex items-center gap-2">
            {skill.name} <span className="font-mono text-[9px] uppercase text-hw-text-muted font-normal">{skill.category}</span>
          </div>
          <div className="flex-1 font-mono text-xs text-hw-accent-blue">
            {skill.proficiency}%
          </div>
          <div className="w-24 flex justify-end gap-2">
            <button onClick={actions.onEdit} className="hw-button">EDIT</button>
            <button onClick={actions.onDelete} className="hw-button hover:!text-red-500 hover:!border-red-500">DEL</button>
          </div>
        </>
      )}
      renderForm={({ onSave, onCancel, initialData }) => {
        const [name, setName] = useState(initialData?.name || '');
        const [category, setCategory] = useState(initialData?.category || 'Languages');
        const [proficiency, setProficiency] = useState(initialData?.proficiency || 50);
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
          if (initialData) {
            setName(initialData.name);
            setCategory(initialData.category);
            setProficiency(initialData.proficiency);
          }
        }, [initialData]);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          await onSave({ name, category, proficiency });
          setIsSubmitting(false);
        };

        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Skill Name" required value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
              <select value={category} onChange={(e) => setCategory((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm">
                <option value="Languages">Languages</option>
                <option value="Technologies">Technologies / Frameworks</option>
                <option value="Concepts">Concepts</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#555] font-mono text-xs w-24">PROFICIENCY:</span>
              <input type="range" min="1" max="100" value={proficiency} onChange={(e) => setProficiency(parseInt((e.target as HTMLInputElement).value))} className="flex-grow accent-hw-accent-orange" />
              <span className="text-hw-accent-orange font-mono text-xs w-8 text-right font-bold">{proficiency}%</span>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button type="button" onClick={onCancel} className="hw-button">CANCEL</button>
              <button type="submit" disabled={isSubmitting} className="hw-button bg-[#111] text-white hover:bg-hw-accent-orange hover:text-white border-none">{isSubmitting ? 'SAVING...' : 'SAVE SKILL'}</button>
            </div>
          </form>
        );
      }}
    />
  );
}
