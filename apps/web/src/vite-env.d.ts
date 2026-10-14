/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public marketing site host, e.g. "localhost" or "schoolerp.app". Schools live at <slug>.<base>. */
  readonly VITE_BASE_DOMAIN?: string;
  /** Platform console host, e.g. "admin.localhost". */
  /** Address used by "Request a demo". */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
