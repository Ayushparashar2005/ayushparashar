import { useState } from 'preact/compat';

export function useCrudManager<T extends { id: string; displayOrder?: number }>(
  initialItems: T[],
  apiEndpoint: string,
  reorderTable: string
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setItems(items.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (payload: Partial<T>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: editingId || payload.id })
      });
      
      if (res.ok) {
        const savedItem = await res.json();
        if (editingId) {
          setItems(items.map(i => i.id === editingId ? savedItem : i));
        } else {
          setItems([...items, savedItem]);
        }
        setIsAdding(false);
        setEditingId(null);
        return true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
    return false;
  };

  const handleSwap = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newItems[index];
    newItems[index] = newItems[swapIndex];
    newItems[swapIndex] = temp;
    
    // Update display order sequentially
    newItems.forEach((p, i) => {
      p.displayOrder = i;
    });
    
    setItems(newItems);

    try {
      await fetch('/api/reorder', {
        method: 'POST', // or PUT depending on reorder.ts implementation
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: reorderTable,
          items: newItems.map(p => ({ id: p.id, displayOrder: p.displayOrder }))
        })
      });
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  return {
    items,
    isAdding, setIsAdding,
    editingId, setEditingId,
    isSubmitting,
    handleDelete,
    handleSave,
    handleSwap
  };
}
