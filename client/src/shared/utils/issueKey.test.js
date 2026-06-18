import { formatIssueKey, issueKey } from './issueKey';
import { normalizeKey, isValidKey, suggestKey } from './projectKey';

describe('issueKey helpers', () => {
  it('formats a key from board key + number', () => {
    expect(formatIssueKey('ABC', 12)).toBe('ABC-12');
  });

  it('falls back to #number when no board key', () => {
    expect(formatIssueKey('', 5)).toBe('#5');
    expect(formatIssueKey(null, 5)).toBe('#5');
  });

  it('returns empty when there is no number', () => {
    expect(formatIssueKey('ABC', null)).toBe('');
    expect(formatIssueKey('', null)).toBe('');
  });

  it('issueKey uses number, then falls back to id', () => {
    expect(issueKey({ key: 'DEV' }, { number: 7, id: 100 })).toBe('DEV-7');
    expect(issueKey({ key: 'DEV' }, { id: 100 })).toBe('DEV-100');
    expect(issueKey(null, null)).toBe('');
  });
});

describe('projectKey helpers', () => {
  it('normalizes to uppercase alphanumerics, max 10', () => {
    expect(normalizeKey('ab-c 1!')).toBe('ABC1');
    expect(normalizeKey('abcdefghijklmnop')).toBe('ABCDEFGHIJ');
    expect(normalizeKey(null)).toBe('');
  });

  it('validates key format', () => {
    expect(isValidKey('ABC')).toBe(true);
    expect(isValidKey('AB1')).toBe(true);
    expect(isValidKey('A')).toBe(false); // too short
    expect(isValidKey('1AB')).toBe(false); // must start with a letter
    expect(isValidKey('ABCDEFGHIJK')).toBe(false); // too long (11)
  });

  it('suggests a key from a name with leading ASCII letters', () => {
    expect(suggestKey('Backend Service')).toBe('BACK');
    expect(suggestKey('My App')).toBe('MYAP');
  });

  it('returns empty suggestion for non-ASCII names', () => {
    expect(suggestKey('サンプル')).toBe('');
  });
});
