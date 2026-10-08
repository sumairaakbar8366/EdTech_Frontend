/** Turns an optional number input into a value for the API ("" → undefined, or null to clear). */
export function optionalNumber(value: string, clearWith: null | undefined = undefined): number | null | undefined {
  return value.trim() === '' ? clearWith : Number(value);
}

/** Wraps a submit handler so the browser does not reload the page. */
export const onSubmit = (fn: () => void) => (e: { preventDefault: () => void }) => {
  e.preventDefault();
  fn();
};
