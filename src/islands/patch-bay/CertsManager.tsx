import React, { useState, useEffect } from 'preact/compat';
import DataTable from './DataTable';

type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string | null;
  displayOrder?: number;
};

export default function CertsManager({ initialCerts }: { initialCerts: Certification[] }) {
  return (
    <DataTable<Certification>
      title="CERTIFICATIONS"
      initialItems={initialCerts}
      apiEndpoint="/api/certifications"
      reorderTable="certifications"
      columns={['ORD', 'TITLE', 'ISSUER', 'DATE']}
      renderRow={(cert, idx, actions) => (
        <>
          <div className="w-12 text-center text-hw-text-muted font-mono text-[10px] flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={actions.onMoveUp} disabled={!actions.canMoveUp} className="hover:text-hw-accent-orange disabled:opacity-20">▲</button>
             <button onClick={actions.onMoveDown} disabled={!actions.canMoveDown} className="hover:text-hw-accent-orange disabled:opacity-20">▼</button>
          </div>
          <div className="flex-1 font-sans font-bold text-sm tracking-tight text-hw-text-main">{cert.title}</div>
          <div className="flex-1 font-mono text-[10px] uppercase text-hw-text-muted">{cert.issuer}</div>
          <div className="flex-1 font-mono text-[10px] text-hw-accent-blue">{cert.date}</div>
          <div className="w-24 flex justify-end gap-2">
            <button onClick={actions.onEdit} className="hw-button">EDIT</button>
            <button onClick={actions.onDelete} className="hw-button hover:!text-red-500 hover:!border-red-500">DEL</button>
          </div>
        </>
      )}
      renderForm={({ onSave, onCancel, initialData }) => {
        const [title, setTitle] = useState(initialData?.title || '');
        const [issuer, setIssuer] = useState(initialData?.issuer || '');
        const [date, setDate] = useState(initialData?.date || '');
        const [credentialUrl, setCredentialUrl] = useState(initialData?.credentialUrl || '');
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
          if (initialData) {
            setTitle(initialData.title);
            setIssuer(initialData.issuer);
            setDate(initialData.date);
            setCredentialUrl(initialData.credentialUrl || '');
          }
        }, [initialData]);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          await onSave({ title, issuer, date, credentialUrl });
          setIsSubmitting(false);
        };

        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Certification Title" required value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
              <input type="text" placeholder="Issuer (e.g. AWS)" required value={issuer} onChange={(e) => setIssuer((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Date (e.g. 2024)" required value={date} onChange={(e) => setDate((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
              <input type="text" placeholder="Credential URL" value={credentialUrl} onChange={(e) => setCredentialUrl((e.target as HTMLInputElement).value)} className="bg-hw-sticker border border-hw-border text-hw-text-main px-3 py-2 text-sm font-sans focus:border-hw-accent-orange outline-none rounded-sm" />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button type="button" onClick={onCancel} className="hw-button">CANCEL</button>
              <button type="submit" disabled={isSubmitting} className="hw-button bg-[#111] text-white hover:bg-hw-accent-orange hover:text-white border-none">{isSubmitting ? 'SAVING...' : 'SAVE CERT'}</button>
            </div>
          </form>
        );
      }}
    />
  );
}
