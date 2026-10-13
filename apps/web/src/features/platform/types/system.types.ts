export type DeliveryChannel = 'email' | 'sms' | 'whatsapp' | 'push';
export type DeliveryStatus = 'queued' | 'sent' | 'failed';

/** One outbound message (the body is never stored). */
export interface OutboundMessage {
  id: string;
  channel: DeliveryChannel;
  recipient: string;
  template: string;
  subject: string | null;
  status: DeliveryStatus;
  provider: string | null;
  attempts: number;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
  school: { id: string; name: string; slug: string } | null;
}

export interface DeliveryFilter {
  channel?: DeliveryChannel | '';
  status?: DeliveryStatus | '';
  search?: string;
  page: number;
}

export interface DeliveryPage {
  items: OutboundMessage[];
  total: number;
  page: number;
  pageSize: number;
  last24h: Record<DeliveryStatus, number>;
  /** Which provider handles each channel: "smtp", "outbox" … */
  providers: Record<DeliveryChannel, string>;
}

export interface QueueCounts {
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
}

export interface ScheduledJob {
  id: string;
  cron: string;
  tz: string;
  description: string;
  nextRunAt: string | null;
  lastRun: { at: string; ok: boolean; ms: number; error?: string } | null;
}

export interface JobsOverview {
  workersEnabled: boolean;
  queues: { delivery: QueueCounts | null; scheduled: QueueCounts | null };
  jobs: ScheduledJob[];
}
