/**
 * Check that a value is defined.
 *
 * @throws Error if `value` is `null` or `undefined`
 */
export function checkDefined<T>(value: T | null | undefined): T {
  if (value === null) {
    throw new Error("unexpected null value");
  } else if (value === undefined) {
    throw new Error("unexpected undefined value");
  }
  return value;
}
