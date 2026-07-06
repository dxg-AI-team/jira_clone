/* A small, practical subset of Jira Query Language (JQL) evaluated client-side
 * against the board's issues.
 *
 * Supported:
 *   field OP value            OP: = != > >= < <= ~ !~
 *   field IN (a, b, c)        also NOT IN
 *   field IS EMPTY            also IS NOT EMPTY
 *   condition AND/OR condition, NOT condition, parentheses
 *   ORDER BY field [ASC|DESC][, ...]
 *   values: "quoted" 'quoted' bareword number (list) currentUser()
 *
 * Fields: summary/title, status, type, priority, assignee, reporter, labels,
 *         sprint, created, updated, key.
 */
import { IssueType, IssueTypeCopy, IssuePriorityCopy } from 'shared/constants/issues';

// ---- tokenizer ----------------------------------------------------------

const KEYWORDS = ['AND', 'OR', 'NOT', 'IN', 'IS', 'EMPTY', 'ORDER', 'BY', 'ASC', 'DESC'];

const tokenize = input => {
  const tokens = [];
  let i = 0;
  const s = input;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i += 1;
    } else if (c === '(' || c === ')' || c === ',') {
      tokens.push({ type: c, value: c });
      i += 1;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      let str = '';
      while (j < s.length && s[j] !== c) {
        str += s[j];
        j += 1;
      }
      if (j >= s.length) throw new Error('引用符が閉じられていません。');
      tokens.push({ type: 'string', value: str });
      i = j + 1;
    } else if (c === '=' || c === '~') {
      tokens.push({ type: 'op', value: c });
      i += 1;
    } else if (c === '!') {
      if (s[i + 1] === '=' || s[i + 1] === '~') {
        tokens.push({ type: 'op', value: `!${s[i + 1]}` });
        i += 2;
      } else {
        throw new Error("'!' の後には = か ~ が必要です。");
      }
    } else if (c === '>' || c === '<') {
      if (s[i + 1] === '=') {
        tokens.push({ type: 'op', value: `${c}=` });
        i += 2;
      } else {
        tokens.push({ type: 'op', value: c });
        i += 1;
      }
    } else {
      // bareword: identifier / number / function name
      let j = i;
      while (j < s.length && /[^\s()",=~<>!]/.test(s[j])) j += 1;
      const word = s.slice(i, j);
      const upper = word.toUpperCase();
      if (KEYWORDS.includes(upper)) tokens.push({ type: 'kw', value: upper });
      else tokens.push({ type: 'word', value: word });
      i = j;
    }
  }
  return tokens;
};

// ---- parser (recursive descent) ----------------------------------------

const parse = tokens => {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => {
    const t = tokens[pos];
    pos += 1;
    return t;
  };
  const expect = (type, value) => {
    const t = next();
    if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error('クエリの構文が正しくありません。');
    }
    return t;
  };

  const parseValue = () => {
    const t = peek();
    if (!t) throw new Error('値がありません。');
    if (t.type === '(') {
      next();
      const list = [];
      while (peek() && peek().type !== ')') {
        list.push(parseSingleValue());
        if (peek() && peek().type === ',') next();
      }
      expect(')');
      return { kind: 'list', items: list };
    }
    return parseSingleValue();
  };

  const parseSingleValue = () => {
    const t = next();
    if (!t) throw new Error('値がありません。');
    if (t.type === 'string') return { kind: 'literal', value: t.value };
    if (t.type === 'word') {
      // function call like currentUser()
      if (peek() && peek().type === '(') {
        next();
        expect(')');
        return { kind: 'func', name: t.value.toLowerCase() };
      }
      return { kind: 'literal', value: t.value };
    }
    throw new Error('値がありません。');
  };

  const parseCondition = () => {
    const fieldTok = next();
    if (!fieldTok || fieldTok.type !== 'word') throw new Error('フィールド名が必要です。');
    const field = fieldTok.value.toLowerCase();
    const t = peek();
    if (t && t.type === 'kw' && t.value === 'IS') {
      next();
      let negate = false;
      if (peek() && peek().type === 'kw' && peek().value === 'NOT') {
        next();
        negate = true;
      }
      expect('kw', 'EMPTY');
      return { kind: 'cmp', field, op: negate ? 'is not empty' : 'is empty' };
    }
    if (t && t.type === 'kw' && (t.value === 'IN' || t.value === 'NOT')) {
      let op = 'in';
      if (t.value === 'NOT') {
        next();
        expect('kw', 'IN');
        op = 'not in';
      } else {
        next();
      }
      const value = parseValue();
      return { kind: 'cmp', field, op, value };
    }
    if (t && t.type === 'op') {
      next();
      const value = parseValue();
      return { kind: 'cmp', field, op: t.value, value };
    }
    throw new Error(`「${fieldTok.value}」の後に演算子が必要です。`);
  };

  const parsePrimary = () => {
    const t = peek();
    if (t && t.type === '(') {
      next();
      const expr = parseOr();
      expect(')');
      return expr;
    }
    if (t && t.type === 'kw' && t.value === 'NOT') {
      next();
      return { kind: 'not', expr: parsePrimary() };
    }
    return parseCondition();
  };

  const parseAnd = () => {
    let left = parsePrimary();
    while (peek() && peek().type === 'kw' && peek().value === 'AND') {
      next();
      left = { kind: 'and', left, right: parsePrimary() };
    }
    return left;
  };

  const parseOr = () => {
    let left = parseAnd();
    while (peek() && peek().type === 'kw' && peek().value === 'OR') {
      next();
      left = { kind: 'or', left, right: parseAnd() };
    }
    return left;
  };

  let where = null;
  if (peek() && !(peek().type === 'kw' && peek().value === 'ORDER')) {
    where = parseOr();
  }

  const orderBy = [];
  if (peek() && peek().type === 'kw' && peek().value === 'ORDER') {
    next();
    expect('kw', 'BY');
    for (;;) {
      const f = next();
      if (!f || f.type !== 'word') throw new Error('ORDER BY のフィールド名が必要です。');
      let dir = 'asc';
      if (peek() && peek().type === 'kw' && (peek().value === 'ASC' || peek().value === 'DESC')) {
        dir = next().value.toLowerCase();
      }
      orderBy.push({ field: f.field || f.value.toLowerCase(), dir });
      if (peek() && peek().type === ',') next();
      else break;
    }
  }

  if (pos < tokens.length) throw new Error('クエリの末尾に不明なトークンがあります。');
  return { where, orderBy };
};

// ---- field access + value resolution -----------------------------------

const norm = v =>
  String(v == null ? '' : v)
    .trim()
    .toLowerCase();

// Resolve a parsed value node into a comparable primitive for a given field.
const resolveValue = (node, field, ctx) => {
  if (node.kind === 'func') {
    if (node.name === 'currentuser') return ctx.currentUserId;
    throw new Error(`未対応の関数です: ${node.name}()`);
  }
  const raw = node.value;
  switch (field) {
    case 'status': {
      const col = ctx.columns.find(c => norm(c.key) === norm(raw) || norm(c.name) === norm(raw));
      return col ? col.key : raw;
    }
    case 'type': {
      const byCode = Object.values(IssueType).find(t => norm(t) === norm(raw));
      if (byCode) return byCode;
      const entry = Object.entries(IssueTypeCopy).find(([, label]) => norm(label) === norm(raw));
      return entry ? entry[0] : raw;
    }
    case 'priority': {
      if (/^\d+$/.test(String(raw).trim())) return Number(raw);
      const entry = Object.entries(IssuePriorityCopy).find(
        ([, label]) => norm(label) === norm(raw),
      );
      return entry ? Number(entry[0]) : Number(raw);
    }
    case 'assignee':
    case 'reporter': {
      const user = ctx.users.find(u => norm(u.name) === norm(raw));
      return user ? user.id : raw;
    }
    case 'sprint': {
      const sp = ctx.sprints.find(s => norm(s.name) === norm(raw));
      return sp ? sp.id : raw;
    }
    default:
      return raw;
  }
};

const issueFieldValue = (issue, field, ctx) => {
  switch (field) {
    case 'summary':
    case 'title':
      return issue.title;
    case 'status':
      return issue.status;
    case 'type':
      return issue.type;
    case 'priority':
      return Number(issue.priority);
    case 'assignee':
      return issue.userIds || [];
    case 'reporter':
      return issue.reporterId;
    case 'labels':
      return issue.labels || [];
    case 'sprint':
      return issue.sprintId;
    case 'created':
      return issue.createdAt ? new Date(issue.createdAt).getTime() : null;
    case 'updated':
      return issue.updatedAt ? new Date(issue.updatedAt).getTime() : null;
    case 'key':
      return ctx.projectKey && issue.number != null ? `${ctx.projectKey}-${issue.number}` : '';
    default:
      throw new Error(`未対応のフィールドです: ${field}`);
  }
};

const LIST_FIELDS = ['assignee', 'labels'];
const DATE_FIELDS = ['created', 'updated'];

const compare = (issue, cond, ctx) => {
  const { field, op } = cond;
  const actual = issueFieldValue(issue, field, ctx);

  if (op === 'is empty') {
    return Array.isArray(actual) ? actual.length === 0 : actual == null || actual === '';
  }
  if (op === 'is not empty') {
    return Array.isArray(actual) ? actual.length > 0 : !(actual == null || actual === '');
  }

  const resolveOne = node => resolveValue(node, field, ctx);

  if (op === 'in' || op === 'not in') {
    const items = (cond.value.kind === 'list' ? cond.value.items : [cond.value]).map(resolveOne);
    const hit = LIST_FIELDS.includes(field)
      ? items.some(v => actual.includes(v))
      : items.some(v => norm(v) === norm(actual));
    return op === 'in' ? hit : !hit;
  }

  const expected = resolveOne(cond.value);

  if (DATE_FIELDS.includes(field)) {
    const exp = new Date(cond.value.value).getTime();
    if (Number.isNaN(exp) || actual == null) return false;
    if (op === '>') return actual > exp;
    if (op === '>=') return actual >= exp;
    if (op === '<') return actual < exp;
    if (op === '<=') return actual <= exp;
    if (op === '=') return new Date(actual).toDateString() === new Date(exp).toDateString();
    if (op === '!=') return new Date(actual).toDateString() !== new Date(exp).toDateString();
    return false;
  }

  if (LIST_FIELDS.includes(field)) {
    const has = actual.some(v => norm(v) === norm(expected));
    if (op === '=' || op === '~') return has;
    if (op === '!=' || op === '!~') return !has;
    return false;
  }

  if (op === '~') return norm(actual).includes(norm(expected));
  if (op === '!~') return !norm(actual).includes(norm(expected));
  if (op === '=') return norm(actual) === norm(expected);
  if (op === '!=') return norm(actual) !== norm(expected);
  if (field === 'priority') {
    if (op === '>') return actual > expected;
    if (op === '>=') return actual >= expected;
    if (op === '<') return actual < expected;
    if (op === '<=') return actual <= expected;
  }
  throw new Error(`「${field}」に演算子 ${op} は使用できません。`);
};

const evalNode = (issue, node, ctx) => {
  if (!node) return true;
  switch (node.kind) {
    case 'and':
      return evalNode(issue, node.left, ctx) && evalNode(issue, node.right, ctx);
    case 'or':
      return evalNode(issue, node.left, ctx) || evalNode(issue, node.right, ctx);
    case 'not':
      return !evalNode(issue, node.expr, ctx);
    case 'cmp':
      return compare(issue, node, ctx);
    default:
      return true;
  }
};

// Run a JQL query. Returns { issues } on success or { error } on a parse/eval
// failure. `ctx` supplies board context: { currentUserId, users, columns,
// sprints, projectKey }.
export const runJql = (allIssues, query, ctx) => {
  const trimmed = String(query || '').trim();
  if (!trimmed) return { issues: allIssues };
  let ast;
  try {
    ast = parse(tokenize(trimmed));
  } catch (error) {
    return { error: error.message || 'クエリを解析できません。' };
  }
  try {
    let issues = allIssues.filter(issue => evalNode(issue, ast.where, ctx));
    if (ast.orderBy.length) {
      issues = [...issues].sort((a, b) => {
        for (const { field, dir } of ast.orderBy) {
          const av = issueFieldValue(a, field, ctx);
          const bv = issueFieldValue(b, field, ctx);
          let cmp = 0;
          if (av == null && bv != null) cmp = -1;
          else if (av != null && bv == null) cmp = 1;
          else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
          else cmp = String(av).localeCompare(String(bv));
          if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
        }
        return 0;
      });
    }
    return { issues };
  } catch (error) {
    return { error: error.message || 'クエリを評価できません。' };
  }
};
