/** A sidebar entry with its full URL. `end` makes it active only on an exact match (dashboards). */
export interface ShellNavItem {
  label: string;
  path: string;
  end?: boolean;
  /** Not included in the school's plan: shown with a lock. */
  locked?: boolean;
}

/** Another role area the user can switch to. */
export interface AreaOption {
  slug: string;
  label: string;
  href: string;
}
