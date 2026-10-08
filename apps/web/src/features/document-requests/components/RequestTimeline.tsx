import { STATUS_LABEL, type DocumentRequest } from '@/features/document-requests/requests';

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Vertical history of a request: each status change with who, when and the note. */
export function RequestTimeline({ request }: { request: DocumentRequest }) {
  return (
    <ol className="relative ml-2 space-y-4 border-l border-slate-200 pl-5 dark:border-white/10">
      {request.events.map((e, i) => {
        const last = i === request.events.length - 1;
        return (
          <li key={e.id} className="relative">
            <span aria-hidden className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-4 ring-white dark:ring-[#171e29] ${last ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{STATUS_LABEL[e.status]}</span>
              <span className="text-xs text-slate-500">{fmt(e.createdAt)}{e.actorName ? ` · ${e.actorName}` : ''}</span>
            </div>
            {e.note && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{e.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
