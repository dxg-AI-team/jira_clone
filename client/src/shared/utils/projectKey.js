// Board key helpers, mirroring api/src/utils/projectKey.ts. A key is a short
// uppercase identifier (e.g. ABC) used as the prefix of every issue key.
export const KEY_MAX = 10;
export const KEY_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/;

export const normalizeKey = raw =>
  String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, KEY_MAX);

export const isValidKey = key => KEY_PATTERN.test(key);

// Suggest a key from a board name (first letters). Empty when the name has no
// usable leading ASCII letter (e.g. a Japanese-only name) — the user then types
// their own key.
export const suggestKey = name => {
  const base = normalizeKey(name).slice(0, 4);
  return base.length >= 2 && /^[A-Z]/.test(base) ? base : '';
};
