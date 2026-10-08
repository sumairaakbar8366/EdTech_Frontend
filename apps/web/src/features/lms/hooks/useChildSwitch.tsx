import { useEffect, useState } from 'react';
import { useLmsChildren } from '@/features/lms/hooks/useLms';

/** Parents switch between children; everyone else sees their own scope. */
export function useChildSwitch() {
  const children = useLmsChildren();
  const [childId, setChildId] = useState<string | undefined>();
  useEffect(() => {
    if (!childId && children.data?.[0]) setChildId(children.data[0].id);
  }, [children.data, childId]);
  const switcher =
    children.data && children.data.length > 1 ? (
      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {children.data.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === childId}
            onClick={() => setChildId(c.id)}
            className={`focus-ring rounded-full px-4 py-1.5 text-base font-semibold transition ${c.id === childId ? 'bg-brand text-white' : 'surface text-slate-700 dark:text-slate-200'}`}
          >
            {c.firstName} {c.lastName}
          </button>
        ))}
      </div>
    ) : null;
  return { childId: children.data?.length ? childId : undefined, ready: children.isSuccess && (!children.data.length || !!childId), switcher };
}
