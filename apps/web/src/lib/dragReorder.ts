import { useState, type DragEvent } from 'react';

/**
 * Drag-and-drop reordering for a list, with a grip to pick a row up (so text boxes inside a row stay
 * usable). `row(i)` goes on the row, `grip(i)` on its handle; `over` is the row being hovered, for a highlight.
 */
export function useDragReorder(onMove: (from: number, to: number) => void) {
  const [armed, setArmed] = useState<number | null>(null);
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const end = () => { setFrom(null); setOver(null); setArmed(null); };
  return {
    from,
    over,
    row: (i: number) => ({
      draggable: armed === i,
      onDragStart: (e: DragEvent) => { setFrom(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); },
      onDragOver: (e: DragEvent) => { if (from === null) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (over !== i) setOver(i); },
      onDrop: (e: DragEvent) => { e.preventDefault(); if (from !== null && from !== i) onMove(from, i); end(); },
      onDragEnd: end,
    }),
    grip: (i: number) => ({ onMouseDown: () => setArmed(i), onMouseUp: () => setArmed(null), onTouchStart: () => setArmed(i) }),
  };
}

/** Moves one item to a new position. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}
