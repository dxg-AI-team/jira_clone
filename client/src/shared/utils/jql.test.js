import { runJql } from './jql';

const ctx = {
  currentUserId: 1,
  users: [
    { id: 1, name: '田中' },
    { id: 2, name: '佐藤' },
  ],
  columns: [
    { key: 'backlog', name: '未着手' },
    { key: 'inprogress', name: '進行中' },
    { key: 'done', name: '完了' },
  ],
  sprints: [{ id: 10, name: 'Sprint 1' }],
  projectKey: 'ABC',
};

const issues = [
  {
    id: 1,
    number: 1,
    title: 'ログイン画面の不具合',
    type: 'bug',
    status: 'backlog',
    priority: '5',
    userIds: [1],
    reporterId: 2,
    labels: ['frontend'],
    sprintId: 10,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 2,
    number: 2,
    title: 'API のリファクタ',
    type: 'task',
    status: 'done',
    priority: '3',
    userIds: [2],
    reporterId: 1,
    labels: ['backend'],
    sprintId: null,
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    id: 3,
    number: 3,
    title: 'ドキュメント整備',
    type: 'task',
    status: 'inprogress',
    priority: '2',
    userIds: [],
    reporterId: 1,
    labels: ['frontend', 'docs'],
    sprintId: 10,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-02T00:00:00Z',
  },
];

const ids = query => {
  const { issues: res, error } = runJql(issues, query, ctx);
  if (error) throw new Error(error);
  return res.map(i => i.id);
};

describe('runJql', () => {
  it('empty query returns all issues', () => {
    expect(ids('')).toEqual([1, 2, 3]);
  });

  it('status by key or column name', () => {
    expect(ids('status = backlog')).toEqual([1]);
    expect(ids('status = "未着手"')).toEqual([1]);
    expect(ids('status != done')).toEqual([1, 3]);
  });

  it('type filter', () => {
    expect(ids('type = task')).toEqual([2, 3]);
    expect(ids('type = バグ')).toEqual([1]);
  });

  it('priority numeric comparison', () => {
    expect(ids('priority >= 3')).toEqual([1, 2]);
    expect(ids('priority < 3')).toEqual([3]);
  });

  it('AND / OR / NOT with precedence', () => {
    expect(ids('type = task AND priority >= 3')).toEqual([2]);
    expect(ids('status = backlog OR status = done')).toEqual([1, 2]);
    expect(ids('NOT type = task')).toEqual([1]);
    // AND binds tighter than OR
    expect(ids('type = bug OR type = task AND priority < 3')).toEqual([1, 3]);
    // parentheses override
    expect(ids('(type = bug OR type = task) AND priority < 3')).toEqual([3]);
  });

  it('IN / NOT IN', () => {
    expect(ids('status IN (backlog, done)')).toEqual([1, 2]);
    expect(ids('status NOT IN (backlog, done)')).toEqual([3]);
  });

  it('text contains (~)', () => {
    expect(ids('summary ~ ログイン')).toEqual([1]);
    expect(ids('title ~ の')).toEqual([1, 2]);
  });

  it('assignee / reporter with currentUser()', () => {
    expect(ids('assignee = 田中')).toEqual([1]);
    expect(ids('reporter = currentUser()')).toEqual([2, 3]);
    expect(ids('assignee IS EMPTY')).toEqual([3]);
  });

  it('labels membership', () => {
    expect(ids('labels = frontend')).toEqual([1, 3]);
    expect(ids('labels IN (docs, backend)')).toEqual([2, 3]);
  });

  it('sprint including empty', () => {
    expect(ids('sprint = "Sprint 1"')).toEqual([1, 3]);
    expect(ids('sprint IS EMPTY')).toEqual([2]);
  });

  it('created date range', () => {
    expect(ids('created >= 2026-03-01')).toEqual([2, 3]);
    expect(ids('created < 2026-02-01')).toEqual([1]);
  });

  it('key lookup', () => {
    expect(ids('key = ABC-2')).toEqual([2]);
  });

  it('ORDER BY', () => {
    expect(ids('ORDER BY priority DESC')).toEqual([1, 2, 3]);
    expect(ids('ORDER BY priority ASC')).toEqual([3, 2, 1]);
    expect(ids('type = task ORDER BY created DESC')).toEqual([3, 2]);
  });

  it('returns an error for malformed queries', () => {
    expect(runJql(issues, 'status =', ctx).error).toBeTruthy();
    expect(runJql(issues, 'status backlog', ctx).error).toBeTruthy();
    expect(runJql(issues, 'status = "unclosed', ctx).error).toBeTruthy();
  });
});
