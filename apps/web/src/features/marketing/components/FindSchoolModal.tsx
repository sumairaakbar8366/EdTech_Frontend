import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { normalizeSchoolSlug, schoolOrigin } from '@/config/site';
import { onSubmit } from '@/lib/forms';

/** Asks for the school's address and sends the visitor to that school's sign-in page. */
export function FindSchoolModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [school, setSchool] = useState('');
  const [error, setError] = useState<string | null>(null);
  function go() {
    const slug = normalizeSchoolSlug(school);
    if (!slug) {
      setError('Enter your school address, e.g. "greenfield".');
      return;
    }
    window.location.href = schoolOrigin(slug);
  }
  return (
    <Modal
      open={open}
      title="Sign in to your school"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="find-school" icon={ArrowRight}>Continue</Button>
        </>
      }
    >
      <form id="find-school" onSubmit={onSubmit(go)} className="space-y-3">
        <p className="text-base text-slate-600 dark:text-slate-300">Each school has its own secure address. Enter yours to continue to its sign-in page.</p>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 dark:border-white/10">
          <input
            autoFocus
            value={school}
            onChange={(e) => { setSchool(e.target.value); setError(null); }}
            placeholder="your-school"
            aria-label="School address"
            className="min-w-0 flex-1 bg-white px-3.5 py-2 text-lg outline-none dark:bg-[#0e1626] dark:text-white"
          />
          <span className="flex items-center bg-slate-100 px-3 text-base text-slate-500 dark:bg-white/5">.{window.location.host}</span>
        </div>
        {error && <p className="text-base text-rose-600">{error}</p>}
      </form>
    </Modal>
  );
}
