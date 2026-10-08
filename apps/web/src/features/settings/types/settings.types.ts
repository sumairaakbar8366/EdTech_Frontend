export interface SchoolSettings {
  timezone: string;
  locale: string;
  currency: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  weeklyOffDays: number[];
}

export interface SchoolDomain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  verifiedAt: string | null;
  txtName: string;
  txtValue: string;
  cnameTarget: string;
}

export interface SettingsView {
  school: { name: string; slug: string; address: string };
  settings: SchoolSettings | null;
  domains: SchoolDomain[];
}
