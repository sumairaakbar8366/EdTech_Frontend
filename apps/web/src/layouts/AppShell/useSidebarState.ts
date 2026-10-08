import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

export const SIDEBAR_MIN = 216;
export const SIDEBAR_MAX = 360;
const COMPACT_WIDTH = 72;

function stored<T>(key: string, parse: (v: string | null) => T, fallback: T): T {
  try {
    return parse(localStorage.getItem(key));
  } catch {
    return fallback;
  }
}

/** Sidebar width (drag or arrow keys), compact mode and mobile drawer; width/compact persist per browser. */
export function useSidebarState() {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(() =>
    stored('schoolerp-sidebar-width', (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= SIDEBAR_MIN && n <= SIDEBAR_MAX ? n : 264;
    }, 264),
  );
  const [compact, setCompact] = useState(() => stored('schoolerp-sidebar-compact', (v) => v === 'true', false));
  const resizing = useRef(false);

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (resizing.current) setWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, event.clientX)));
    };
    const stop = () => {
      resizing.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      document.body.style.cursor = '';
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('schoolerp-sidebar-width', String(width)); } catch { /* per-browser convenience only */ }
  }, [width]);
  useEffect(() => {
    try { localStorage.setItem('schoolerp-sidebar-compact', String(compact)); } catch { /* per-browser convenience only */ }
  }, [compact]);

  return {
    open,
    setOpen,
    compact,
    toggleCompact: () => setCompact((v) => !v),
    width,
    size: compact ? COMPACT_WIDTH : width,
    startResize(event: PointerEvent) {
      if (compact) return;
      event.preventDefault();
      resizing.current = true;
      document.body.style.cursor = 'col-resize';
    },
    resizeWithKeyboard(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      setCompact(false);
      setWidth((w) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, w + (event.key === 'ArrowRight' ? 16 : -16))));
    },
  };
}
