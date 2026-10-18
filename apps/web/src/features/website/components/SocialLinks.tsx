import { ExternalLink, MessageCircle } from 'lucide-react';
import { socialEntries, type SocialLinks as Links } from '@/features/website/social';

/** Labelled links to the accounts that are set (nothing when none is). */
export function SocialLinks({ links, className = '', linkClassName = '' }: { links: Partial<Links>; className?: string; linkClassName?: string }) {
  const entries = socialEntries(links);
  if (!entries.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {entries.map((e) => (
        <a key={e.key} href={e.href} target="_blank" rel="noopener noreferrer" aria-label={e.key === 'whatsapp' ? 'Chat on WhatsApp' : `Follow us on ${e.name}`} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset transition-colors ${linkClassName}`}>
          {e.key === 'whatsapp' ? <MessageCircle size={15} /> : <ExternalLink size={14} />} {e.name}
        </a>
      ))}
    </div>
  );
}
