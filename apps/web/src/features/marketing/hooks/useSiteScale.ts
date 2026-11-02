import { useEffect } from 'react';

/** Marks the page as a public (marketing) page while it is open: the screen-size scaling in index.css applies only here. */
export function useSiteScale() {
  useEffect(() => {
    document.documentElement.classList.add('site-scale');
    return () => document.documentElement.classList.remove('site-scale');
  }, []);
}
