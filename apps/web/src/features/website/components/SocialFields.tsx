import { Field, Input } from '@/components/ui';
import { SOCIAL_FIELDS, type SocialLinks } from '@/features/website/social';

/** Inputs for the social accounts; empty fields are simply not shown on the site. */
export function SocialFields({ value, onChange }: { value: Partial<SocialLinks>; onChange: (next: Partial<SocialLinks>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
        <Field key={key} label={label} hint={key === 'whatsapp' ? 'Visitors tap it to chat with you on WhatsApp' : undefined}>
          <Input type={key === 'whatsapp' ? 'tel' : 'url'} maxLength={300} placeholder={placeholder} value={value[key] ?? ''} onChange={(e) => onChange({ ...value, [key]: e.target.value || null })} />
        </Field>
      ))}
    </div>
  );
}
