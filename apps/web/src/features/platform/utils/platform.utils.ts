/** The school's own address, on the same port the console is served from. */
export function schoolUrl(slug: string): string {
  const { protocol, hostname, port } = window.location;
  const base = hostname.split('.').slice(1).join('.') || hostname;
  return `${protocol}//${slug}.${base}${port ? `:${port}` : ''}`;
}

export const tierLimit = (n: number | null) => (n === null ? 'Unlimited' : n.toLocaleString());
