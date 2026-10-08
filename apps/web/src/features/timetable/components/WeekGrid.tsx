import { Coffee, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui';
import type { TimetableSlot } from '@/features/timetable/types/timetable.types';
import { subjectAccent } from '@/features/timetable/utils/timetable.utils';
import { DAY_NAMES } from '@/lib/format';

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/**
 * Week timetable as a grid: periods (rows) × days (columns), with a break row wherever the
 * school day has a gap. Saturday/Sunday columns appear only when they have periods.
 */
export function WeekGrid({ slots, show, onDelete, highlightDay }: { slots: TimetableSlot[]; show: 'teacher' | 'section'; onDelete?: (slot: TimetableSlot) => void; highlightDay?: number }) {
  const days = [1, 2, 3, 4, 5, ...[6, 7].filter((d) => slots.some((s) => s.dayOfWeek === d))];
  const periods = [...new Map(slots.map((s) => [`${s.startMinute}-${s.endMinute}`, { start: s.startMinute, end: s.endMinute }])).values()].sort((a, b) => a.start - b.start || a.end - b.end);
  if (periods.length === 0) return <p className="py-10 text-center text-slate-500">No periods scheduled yet.</p>;

  const rows: ({ kind: 'period'; start: number; end: number } | { kind: 'break'; start: number; end: number })[] = [];
  periods.forEach((p, i) => {
    const prev = periods[i - 1];
    if (prev && p.start - prev.end >= 10) rows.push({ kind: 'break', start: prev.end, end: p.start });
    rows.push({ kind: 'period', ...p });
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 table-fixed border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="w-24 border-b border-(--surface-border) px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>
            {days.map((d) => (
              <th key={d} className={`border-b px-3 py-3 text-left text-xs font-bold uppercase tracking-wider ${d === highlightDay ? 'border-orange-400 text-orange-700 dark:text-orange-300' : 'border-(--surface-border) text-(--ink)'}`}>
                {DAY_NAMES[d]}{d === highlightDay && <span className="ml-1.5 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">Today</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            row.kind === 'break' ? (
              <tr key={`b${row.start}`}>
                <td className="border-b border-(--surface-border) px-3 py-1.5 text-xs tabular-nums text-slate-400">{hhmm(row.start)}</td>
                <td colSpan={days.length} className="border-b border-(--surface-border) bg-slate-50 px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:bg-white/2">
                  <Coffee size={12} className="mr-1 inline" /> Break · {row.end - row.start} min
                </td>
              </tr>
            ) : (
              <tr key={`${row.start}-${row.end}`}>
                <td className="border-b border-(--surface-border) px-3 py-2 align-top">
                  <div className="font-semibold tabular-nums text-(--ink)">{hhmm(row.start)}</div>
                  <div className="text-xs tabular-nums text-slate-400">{hhmm(row.end)}</div>
                </td>
                {days.map((d) => {
                  const cell = slots.filter((s) => s.dayOfWeek === d && s.startMinute === row.start && s.endMinute === row.end);
                  return (
                    <td key={d} className={`border-b border-(--surface-border) p-1.5 align-top ${d === highlightDay ? 'bg-orange-50/60 dark:bg-orange-500/4' : ''}`}>
                      {cell.length === 0 && <div className="px-2 py-2 text-slate-300 dark:text-slate-600">—</div>}
                      {cell.map((s) => (
                        <div key={s.id} className={`group relative rounded-md border-l-[3px] bg-slate-50 px-2.5 py-2 dark:bg-white/3 ${subjectAccent(s.subjectId)}`}>
                          <div className="truncate pr-6 font-semibold text-slate-800 dark:text-slate-100">{s.subject.name}</div>
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {show === 'teacher' ? `${s.employee.firstName} ${s.employee.lastName}` : `${s.section.schoolClass.name} ${s.section.name}`}
                            {s.room && <> · {s.room.name}</>}
                          </div>
                          {onDelete && (
                            <span className="absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                              <IconButton icon={Trash2} label={`Remove ${s.subject.name} ${DAY_NAMES[d]} ${s.startTime}`} tone="danger" onClick={() => onDelete(s)} />
                            </span>
                          )}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
