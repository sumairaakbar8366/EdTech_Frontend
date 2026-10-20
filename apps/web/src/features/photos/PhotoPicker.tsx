import { Camera, Check, Loader2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Avatar } from '@/components/ui';
import { photoService } from '@/features/photos/photos';
import { errorMessage } from '@/lib/errors';

/**
 * Choose a profile picture: shows it at once and uploads it in the background; `onChange` gets the
 * id the form sends along. `publicForm` is for the school website (not signed in).
 */
export function PhotoPicker({
  value,
  onChange,
  name,
  currentKey,
  label = 'Photo',
  hint,
  required = false,
  publicForm = false,
}: {
  value: string | null;
  onChange: (photoId: string | null) => void;
  name: string;
  currentKey?: string | null;
  label?: string;
  hint?: string;
  required?: boolean;
  publicForm?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { if (!value && preview) setPreview(null); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!/^image\/(png|jpe?g)$/.test(file.type)) return setError('Choose a JPG or PNG picture.');
    if (file.size > 3 * 1024 * 1024) return setError('The picture must be at most 3 MB.');
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const { photoId } = await (publicForm ? photoService.stagePublic(file) : photoService.stage(file));
      onChange(photoId);
    } catch (e) {
      setPreview(null);
      onChange(null);
      setError(errorMessage(e, 'Could not upload the picture.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={required ? 'field field-required' : 'field'}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</label>
      <div className="flex items-center gap-4">
        {preview ? <img src={preview} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-500/20" /> : <Avatar photoKey={currentKey} name={name || '?'} size="lg" ring />}
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : value ? <Check size={15} className="text-emerald-600" /> : <Camera size={15} />}
            {value || currentKey ? 'Change picture' : 'Add picture'}
          </button>
          <p className="mt-1 text-xs text-slate-500">{hint ?? 'A clear, recent photo of the face. JPG or PNG, up to 3 MB.'}</p>
          {required && !value && !currentKey && <p className="mt-0.5 text-xs text-slate-500">Required.</p>}
          {error && <p className="mt-0.5 text-xs text-rose-600">{error}</p>}
        </div>
      </div>
      <input id={id} ref={input} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => { void choose(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}
