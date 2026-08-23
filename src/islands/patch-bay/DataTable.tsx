import React from 'preact/compat';
import { useCrudManager } from './useCrudManager';

type DataTableProps<T> = {
  title: string;
  initialItems: T[];
  apiEndpoint: string;
  reorderTable: string;
  columns: string[];
  renderRow: (item: T, idx: number, actions: { onEdit: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; canMoveUp: boolean; canMoveDown: boolean }) => React.ReactNode;
  renderForm: (actions: { onSave: (payload: Partial<T>) => Promise<boolean>; onCancel: () => void; editingId: string | null; initialData?: T }) => React.ReactNode;
};

export default function DataTable<T extends { id: string; displayOrder?: number }>({
  title,
  initialItems,
  apiEndpoint,
  reorderTable,
  columns,
  renderRow,
  renderForm
}: DataTableProps<T>) {
  const {
    items,
    isAdding, setIsAdding,
    editingId, setEditingId,
    handleDelete,
    handleSave,
    handleSwap
  } = useCrudManager<T>(initialItems, apiEndpoint, reorderTable);

  const editingItem = items.find(i => i.id === editingId);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center w-full">
        <h2 className="hw-label">{title}</h2>
        <button 
          onClick={() => { setEditingId(null); setIsAdding(!isAdding); }}
          className="hw-button"
        >
          {isAdding || editingId ? 'CANCEL' : 'ADD NEW'}
        </button>
      </div>
      
      {isAdding || editingId ? (
        <div className="bg-hw-sticker border border-hw-border p-4 rounded-md shadow-sm">
          {renderForm({ 
            onSave: handleSave, 
            onCancel: () => { setIsAdding(false); setEditingId(null); },
            editingId,
            initialData: editingItem
          })}
        </div>
      ) : null}

      <div className="hw-module dark:bg-[#050505] dark:border-[#333] dark:shadow-[0_0_15px_rgba(0,170,255,0.05)_inset]">
        <div className="hw-module-header dark:bg-[#111] dark:border-[#333] dark:text-[#00aaff] dark:drop-shadow-[0_0_2px_rgba(0,170,255,0.5)]">
          {columns.map((col, i) => (
            <div key={i} className={i === 0 ? "w-12 text-center" : "flex-1"}>{col}</div>
          ))}
          <div className="w-24 text-right">ACTIONS</div>
        </div>
        
        <div className="flex flex-col divide-y divide-hw-border-screen/50 dark:divide-[#222] max-h-[500px] overflow-y-auto custom-scrollbar">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center px-3 py-3 hover:bg-hw-border/20 dark:hover:bg-[#00aaff]/10 transition-colors group">
              {renderRow(item, idx, {
                onEdit: () => { setEditingId(item.id); setIsAdding(false); },
                onDelete: () => handleDelete(item.id),
                onMoveUp: () => handleSwap(idx, 'up'),
                onMoveDown: () => handleSwap(idx, 'down'),
                canMoveUp: idx > 0,
                canMoveDown: idx < items.length - 1
              })}
            </div>
          ))}
          {items.length === 0 ? (
            <div className="p-8 text-center text-hw-text-muted font-mono text-xs">NO DATA FOUND</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
