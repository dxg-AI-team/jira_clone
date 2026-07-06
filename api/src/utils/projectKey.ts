// A board (Project) "key" is a short uppercase identifier (e.g. ABC) shown as
// the prefix of every issue key (ABC-1, ABC-2 ...). Keys are unique within a
// space, just like Jira project keys are unique within an instance.

export const KEY_MIN = 2;
export const KEY_MAX = 10;
export const KEY_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/;

// Uppercase and strip anything that is not a letter or digit.
export const normalizeKey = (raw: unknown): string =>
  String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

export const isValidKey = (key: string): boolean => KEY_PATTERN.test(key);

// Best-effort key suggestion from a board name (used for backfilling existing
// boards). Falls back to "BOARD" when the name has no usable ASCII letters
// (e.g. a Japanese-only name).
export const deriveKeyFromName = (name: string, fallback = 'BOARD'): string => {
  const base = normalizeKey(name).slice(0, 4);
  if (base.length >= KEY_MIN && /^[A-Z]/.test(base)) return base;
  return fallback;
};

// Return `candidate` if free, otherwise append an incrementing suffix until the
// result is not in `taken` (respecting the max length).
export const ensureUniqueKey = (candidate: string, taken: Set<string>): string => {
  const base = candidate.slice(0, KEY_MAX);
  if (!taken.has(base)) return base;
  let n = 2;
  // Trim the base so "base + number" stays within KEY_MAX.
  for (;;) {
    const suffix = String(n);
    const key = `${base.slice(0, KEY_MAX - suffix.length)}${suffix}`;
    if (!taken.has(key)) return key;
    n += 1;
  }
};
