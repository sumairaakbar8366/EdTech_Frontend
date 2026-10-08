import { Download } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { lmsService } from '@/features/lms/services/lmsService';
import type { Submission } from '@/features/lms/types/lms.types';
import { errorMessage } from '@/lib/errors';

/** A student's typed answer and/or uploaded file. */
export function SubmissionView({ s }: { s: Submission }) {
  const toast = useToast();
  return (
    <div className="space-y-2">
      {s.textBody && <p className="whitespace-pre-wrap rounded-xl bg-slate-500/5 p-3 text-base text-slate-700 dark:text-slate-200">{s.textBody}</p>}
      {s.hasFile && (
        <Button variant="secondary" icon={Download} onClick={() => lmsService.downloadSubmission(s).catch((e) => toast.error(errorMessage(e, 'Download failed')))}>
          {s.fileName}
        </Button>
      )}
    </div>
  );
}
