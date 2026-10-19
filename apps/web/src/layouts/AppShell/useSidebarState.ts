import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';

export const SIDEBAR_MIN = 216;
export const SIDEBAR_MAX = 360;
export const COMPACT_WIDTH = 72;
/** Small delays so a cursor passing over the rail doesn't flash it open, and a brief slip outside doesn't snap it shut. */
const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_DELAY = 200;
const DESKTOP_QUERY = '(min-width: 1024px)';

function stored<T>(key: string, parse: (v: string | null) => T, fallback: T): T {
  try {
    return parse(localStorage.getItem(key));
  } catch {
    return fallback;
  }
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const change = () => setDesktop(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return desktop;
}

/**
 * Sidebar state. On desktop it rests as a slim icon rail, expands over the page on hover (or keyboard focus)
 * and can be pinned open; pinned and width persist per browser. On small screens it is a full-width drawer.
 */
export function useSidebarState(storageKey = 'schoolerp-sidebar', defaultWidth = 264, compactWidth = COMPACT_WIDTH) {
  const desktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(() =>
    stored(`${storageKey}-width`, (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= SIDEBAR_MIN && n <= SIDEBAR_MAX ? n : defaultWidth;
    }, defaultWidth),
  );
  const [pinned, setPinned] = useState(() => stored(`${storageKey}-pinned`, (v) => v === 'true', false));
  const [hovered, setHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const resizingRef = useRef(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (resizingRef.current) setWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, event.clientX)));
    };
    const stop = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      setResizing(false);
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
      clearTimeout(hoverTimer.current);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(`${storageKey}-width`, String(width)); } catch { /* per-browser convenience only */ }
  }, [width]);
  useEffect(() => {
    try { localStorage.setItem(`${storageKey}-pinned`, String(pinned)); } catch { /* per-browser convenience only */ }
  }, [pinned]);

  const hoverTo = (next: boolean) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHovered(next), next ? HOVER_OPEN_DELAY : HOVER_CLOSE_DELAY);
  };

  // The mobile drawer always shows labels; on desktop the rail is compact unless pinned or hovered.
  const expanded = !desktop || pinned || hovered;

  return {
    open,
    setOpen,
    compact: !expanded,
    pinned,
    togglePinned: () => setPinned((v) => !v),
    /** Unpinned and opened by hover: the panel floats over the page instead of pushing it. */
    floating: desktop && !pinned && hovered,
    resizing,
    width,
    /** Width the panel is drawn at. */
    size: expanded ? width : compactWidth,
    /** Width the page layout reserves for it (the hover expansion overlays the page). */
    reserved: pinned ? width : compactWidth,
    hoverHandlers: {
      onMouseEnter: () => hoverTo(true),
      onMouseLeave: () => hoverTo(false),
      onFocus: () => {
        clearTimeout(hoverTimer.current);
        setHovered(true);
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hoverTo(false);
      },
    },
    startResize(event: PointerEvent) {
      if (!pinned) return;
      event.preventDefault();
      resizingRef.current = true;
      setResizing(true);
      document.body.style.cursor = 'col-resize';
    },
    resizeWithKeyboard(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      setWidth((w) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, w + (event.key === 'ArrowRight' ? 16 : -16))));
    },
  };
}
