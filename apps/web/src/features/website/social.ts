/** Social accounts a school (website settings) or the platform owner (console) adds themselves. */
export interface SocialLinks {
  whatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
  xUrl: string | null;
}

export type SocialKey = keyof SocialLinks;

export const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp number', placeholder: '+923001234567' },
  { key: 'facebookUrl', label: 'Facebook page', placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/yourname' },
  { key: 'youtubeUrl', label: 'YouTube channel', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'linkedinUrl', label: 'LinkedIn page', placeholder: 'https://linkedin.com/company/yourcompany' },
  { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@yourname' },
  { key: 'xUrl', label: 'X (Twitter)', placeholder: 'https://x.com/yourname' },
];

export const EMPTY_SOCIAL: SocialLinks = { whatsapp: null, facebookUrl: null, instagramUrl: null, youtubeUrl: null, linkedinUrl: null, tiktokUrl: null, xUrl: null };

/** "+92 300 1234567" → "https://wa.me/923001234567" (opens a chat in WhatsApp). */
export const whatsappLink = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;

const NAMES: Record<SocialKey, string> = { whatsapp: 'WhatsApp', facebookUrl: 'Facebook', instagramUrl: 'Instagram', youtubeUrl: 'YouTube', linkedinUrl: 'LinkedIn', tiktokUrl: 'TikTok', xUrl: 'X' };

/** The accounts that are set, as links to show (WhatsApp first). */
export const socialEntries = (s: Partial<SocialLinks>) =>
  SOCIAL_FIELDS.flatMap(({ key }) => {
    const v = s[key];
    return v ? [{ key, name: NAMES[key], href: key === 'whatsapp' ? whatsappLink(v) : v }] : [];
  });
