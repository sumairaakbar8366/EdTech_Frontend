import { AlertTriangle, CheckCircle2, Clock, Mail, Play, Send, Server, Timer } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, DataTable, Field, FilterBar, FilterSlot, Input, Modal, PageHeader, Pagination, SearchInput, Select, Spinner, StatCard, StatusBadge, Tabs, type Column, type Tone } from '@/components/ui';
import { DELIVERIES_KEY, JOBS_KEY, useDeliveries, useJobs } from '@/features/platform/hooks/useSystem';
import { systemService } from '@/features/platform/services/systemService';
import type { DeliveryChannel, DeliveryFilter, DeliveryStatus, OutboundMessage, ScheduledJob } from '@/features/platform/types/system.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';

type Tab = 'messages' | 'jobs';

const CHANNEL_LABEL: Record<DeliveryChannel, string> = { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp', push: 'Push' };
const STATUS_TONE: Record<DeliveryStatus, Tone> = { queued: 'amber', sent: 'emerald', failed: 'rose' };
const PROVIDER_LABEL: Record<string, string> = { outbox: 'Test outbox (not sent)', smtp: 'SMTP' };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');

function SendTestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [channel, setChannel] = useState<DeliveryChannel>('email');
  const [to, setTo] = useState('');
  const send = useAction(systemService.sendTest, { success: 'Test message queued', invalidate: [DELIVERIES_KEY], onDone: onClose, toastErrors: false });
  return (
    <Modal
      open={open}
      title="Send a test message"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="send-test" icon={Send} loading={send.isPending}>Send</Button></>}
    >
      <form id="send-test" onSubmit={onSubmit(() => send.mutate({ channel, to }))} className="space-y-4">
        {send.error && <Alert>{errorMessage(send.error)}</Alert>}
        <Field label="Channel">
          <Select value={channel} onChange={(e) => setChannel(e.target.value as DeliveryChannel)}>
            {Object.entries(CHANNEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label={channel === 'email' ? 'Email address' : channel === 'push' ? 'Device / subscription id' : 'Mobile number'} hint={channel === 'sms' || channel === 'whatsapp' ? 'e.g. 0300 1234567 or +923001234567' : undefined}>
          <Input required maxLength={200} type={channel === 'email' ? 'email' : 'text'} value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}

function MessagesTab() {
  const [filter, setFilter] = useState<DeliveryFilter>({ channel: '', status: '', search: '', page: 1 });
  const [testOpen, setTestOpen] = useState(false);
  const data = useDeliveries(filter);
  const d = data.data;
  const set = (patch: Partial<DeliveryFilter>) => setFilter({ ...filter, ...patch, page: patch.page ?? 1 });
  const cols: Column<OutboundMessage>[] = [
    { header: 'Queued', cell: (m) => <span className="whitespace-nowrap text-sm">{when(m.createdAt)}</span> },
    { header: 'Channel', cell: (m) => CHANNEL_LABEL[m.channel] },
    { header: 'To', cell: (m) => <span className="font-mono text-sm">{m.recipient}</span> },
    { header: 'Message', cell: (m) => <div><div>{m.subject ?? m.template}</div><div className="text-sm text-slate-500">{m.template}</div></div> },
    { header: 'School', cell: (m) => m.school?.name ?? <span className="text-slate-500">Platform</span> },
    {
      header: 'Status',
      cell: (m) => (
        <div>
          <StatusBadge status={m.status} tones={STATUS_TONE} />
          <div className="mt-1 text-xs text-slate-500">{m.status === 'sent' ? `${when(m.sentAt)} · ${m.provider}` : `${m.attempts} attempt${m.attempts === 1 ? '' : 's'}`}</div>
          {m.error && <div className="mt-1 max-w-xs text-xs text-rose-600 dark:text-rose-400">{m.error}</div>}
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sent, last 24 h" value={d?.last24h.sent ?? '–'} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Waiting to retry" value={d?.last24h.queued ?? '–'} icon={Clock} tone="amber" />
        <StatCard label="Failed, last 24 h" value={d?.last24h.failed ?? '–'} icon={AlertTriangle} tone="rose" />
      </div>
      {d && (
        <Card title="Providers" icon={Server}>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-base">
            {(Object.keys(CHANNEL_LABEL) as DeliveryChannel[]).map((c) => (
              <span key={c}>{CHANNEL_LABEL[c]}: <Badge tone={d.providers[c] === 'outbox' ? 'amber' : 'emerald'}>{PROVIDER_LABEL[d.providers[c]] ?? d.providers[c]}</Badge></span>
            ))}
          </div>
          {Object.values(d.providers).includes('outbox') && (
            <p className="mt-3 text-sm text-slate-500">Channels on the test outbox are written to files in the API's storage/outbox folder instead of being sent. Add the provider settings to the API environment to send for real.</p>
          )}
        </Card>
      )}
      <Card padded={false} title="Outbound messages" icon={Mail} actions={<Button icon={Send} onClick={() => setTestOpen(true)}>Send test</Button>}>
        <FilterBar>
          <SearchInput label="Search messages" placeholder="Recipient or template" value={filter.search ?? ''} onChange={(search) => set({ search })} />
          <FilterSlot>
            <Select aria-label="Channel" value={filter.channel} onChange={(e) => set({ channel: e.target.value as DeliveryChannel | '' })}>
              <option value="">All channels</option>
              {Object.entries(CHANNEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </FilterSlot>
          <FilterSlot>
            <Select aria-label="Status" value={filter.status} onChange={(e) => set({ status: e.target.value as DeliveryStatus | '' })}>
              <option value="">All statuses</option>
              <option value="queued">Queued</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </Select>
          </FilterSlot>
        </FilterBar>
        {data.isLoading && <div className="p-6"><Spinner /></div>}
        {d?.items.length === 0 && <p className="p-6 text-sm text-slate-500">No messages match.</p>}
        {!!d?.items.length && <DataTable columns={cols} rows={d.items} rowKey={(m) => m.id} />}
        {d && <div className="p-4"><Pagination page={d.page} pageSize={d.pageSize} total={d.total} onChange={(page) => set({ page })} /></div>}
      </Card>
      <SendTestModal key={String(testOpen)} open={testOpen} onClose={() => setTestOpen(false)} />
    </div>
  );
}

function JobsTab() {
  const data = useJobs();
  const run = useAction(systemService.runJob, { success: 'Job finished', invalidate: [JOBS_KEY, DELIVERIES_KEY] });
  const d = data.data;
  const cols: Column<ScheduledJob>[] = [
    { header: 'Job', cell: (j) => <div><div className="font-semibold">{j.id}</div><div className="text-sm text-slate-500">{j.description}</div></div> },
    { header: 'Schedule', cell: (j) => <div className="text-sm"><div className="font-mono">{j.cron}</div><div className="text-slate-500">{j.tz}</div></div> },
    { header: 'Next run', cell: (j) => <span className="whitespace-nowrap text-sm">{when(j.nextRunAt)}</span> },
    {
      header: 'Last run',
      cell: (j) =>
        j.lastRun ? (
          <div className="text-sm">
            <Badge tone={j.lastRun.ok ? 'emerald' : 'rose'}>{j.lastRun.ok ? 'OK' : 'Failed'}</Badge>
            <div className="mt-1 text-slate-500">{when(j.lastRun.at)} · {j.lastRun.ms} ms</div>
            {j.lastRun.error && <div className="text-rose-600 dark:text-rose-400">{j.lastRun.error}</div>}
          </div>
        ) : <span className="text-sm text-slate-500">Not run yet</span>,
    },
    { header: '', align: 'right', cell: (j) => <span className="whitespace-nowrap"><Button variant="secondary" icon={Play} loading={run.isPending && run.variables === j.id} onClick={() => run.mutate(j.id)}>Run now</Button></span> },
  ];
  return (
    <div className="space-y-6">
      {d && !d.workersEnabled && <Alert>Background workers are switched off on this API instance (JOBS_ENABLED=false): messages are queued but not sent, and jobs only run with "Run now".</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Messages waiting" value={d?.queues.delivery ? d.queues.delivery.waiting + d.queues.delivery.delayed + d.queues.delivery.active : '–'} icon={Mail} tone="primary" />
        <StatCard label="Scheduled jobs" value={d?.jobs.length ?? '–'} icon={Timer} tone="teal" />
        <StatCard label="Queue reachable" value={d ? (d.queues.delivery ? 'Yes' : 'No') : '–'} icon={Server} tone={d && !d.queues.delivery ? 'rose' : 'emerald'} />
      </div>
      <Card padded={false} title="Scheduled jobs" icon={Timer}>
        {data.isLoading && <div className="p-6"><Spinner /></div>}
        {d && <DataTable columns={cols} rows={d.jobs} rowKey={(j) => j.id} />}
      </Card>
    </div>
  );
}

/** Platform owner: outbound email / SMS / WhatsApp / push log and the background job schedule. */
export function SystemPage() {
  const [tab, setTab] = useState<Tab>('messages');
  return (
    <div>
      <PageHeader title="System" sub="Outbound messages and scheduled background jobs" icon={Server} />
      <Tabs tabs={[{ id: 'messages', label: 'Messages', icon: Mail }, { id: 'jobs', label: 'Scheduled jobs', icon: Timer }]} value={tab} onChange={setTab} />
      {tab === 'messages' ? <MessagesTab /> : <JobsTab />}
    </div>
  );
}
