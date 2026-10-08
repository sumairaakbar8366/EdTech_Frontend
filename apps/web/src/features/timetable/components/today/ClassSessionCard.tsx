import { CirclePlay, CircleStop, Presentation } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, IconTile, StatusBadge } from '@/components/ui';
import { SLOT_STATE_LABEL, SLOT_STATE_TONE } from '@/features/timetable/constants';
import type { TodaySlot } from '@/features/timetable/services/timetableService';
import type { SlotState } from '@/features/timetable/types/timetable.types';

interface Props {
  slot: TodaySlot;
  state: SlotState;
  isNow: boolean;
  /** Another class is live, so this one cannot start. */
  blocked: boolean;
  starting: boolean;
  ending: boolean;
  onStart: (topic: string | null) => void;
  onEnd: (sessionId: string) => void;
}

/** One of the teacher's periods today with Start / End class. */
export function ClassSessionCard({ slot: s, state, isNow, blocked, starting, ending, onStart, onEnd }: Props) {
  const [topic, setTopic] = useState('');
  return (
    <div className={`surface flex flex-wrap items-center gap-4 rounded-xl p-4 ${state === 'live' ? 'ring-2 ring-emerald-500' : isNow ? 'ring-2 ring-primary-400' : ''}`}>
      <IconTile icon={Presentation} tone={state === 'live' ? 'emerald' : state === 'completed' ? 'primary' : 'magenta'} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{s.subject.name}</span>
          <StatusBadge status={state} tones={SLOT_STATE_TONE} labels={SLOT_STATE_LABEL} />
          {isNow && state === 'scheduled' && <Badge tone="primary">Now</Badge>}
        </div>
        <div className="text-base text-slate-600 dark:text-slate-300">
          <span className="tabular-nums">{s.startTime}–{s.endTime}</span> · {s.section.schoolClass.name} – {s.section.name}{s.room ? ` · ${s.room.name}` : ''}
          {s.session?.topic && <> · <em>{s.session.topic}</em></>}
        </div>
      </div>
      {state === 'scheduled' && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (optional)"
            maxLength={200}
            className="w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-primary-400 dark:border-white/10 dark:bg-[#0e1626] dark:text-white"
          />
          <Button icon={CirclePlay} disabled={blocked} title={blocked ? 'End your live class first' : undefined} loading={starting} onClick={() => onStart(topic || null)}>Start class</Button>
        </div>
      )}
      {state === 'live' && s.session && <Button variant="danger" icon={CircleStop} loading={ending} onClick={() => onEnd(s.session!.id)}>End class</Button>}
    </div>
  );
}
