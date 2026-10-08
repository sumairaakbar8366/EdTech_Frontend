import { useEffect, useState } from 'react';
import { Button, Field, Modal, TextArea } from '@/components/ui';

/** Asks for the reason when a run is returned to accounts or cancelled. */
export function RunNoteModal({ mode, loading, onClose, onSubmit }: { mode: 'return' | 'cancel' | null; loading: boolean; onClose: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState('');
  useEffect(() => setNote(''), [mode]);
  return (
    <Modal
      open={!!mode}
      title={mode === 'return' ? 'Return to accounts' : 'Cancel payroll run'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant={mode === 'cancel' ? 'danger' : 'primary'} loading={loading} disabled={!note.trim()} onClick={() => onSubmit(note)}>
            {mode === 'return' ? 'Return' : 'Cancel run'}
          </Button>
        </>
      }
    >
      <Field label="Reason"><TextArea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} /></Field>
    </Modal>
  );
}
