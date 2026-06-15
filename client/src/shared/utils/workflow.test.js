import { getColumns, getDoneKey, getBacklogKey, getColumnName, columnColor } from './workflow';

describe('getColumns', () => {
  it('returns the default 4 columns when no workflow is configured', () => {
    expect(getColumns(undefined).map(c => c.key)).toEqual([
      'backlog',
      'selected',
      'inprogress',
      'done',
    ]);
    expect(getColumns({}).map(c => c.key)).toEqual(['backlog', 'selected', 'inprogress', 'done']);
  });

  it('parses a custom workflow into ordered columns', () => {
    const project = {
      workflow: JSON.stringify([
        { key: 'todo', name: 'ToDo' },
        { key: 'doing', name: 'Doing', wipLimit: 3 },
        { key: 'done', name: 'Done' },
      ]),
    };
    const cols = getColumns(project);
    expect(cols.map(c => c.key)).toEqual(['todo', 'doing', 'done']);
    expect(cols[1]).toEqual({ key: 'doing', name: 'Doing', wipLimit: 3 });
  });

  it('falls back to defaults for malformed or empty workflow', () => {
    expect(getColumns({ workflow: 'not json' }).length).toBe(4);
    expect(getColumns({ workflow: '[]' }).length).toBe(4);
  });
});

describe('getBacklogKey / getDoneKey', () => {
  it('uses first column as backlog and last as done', () => {
    const project = {
      workflow: JSON.stringify([
        { key: 'a', name: 'A' },
        { key: 'b', name: 'B' },
        { key: 'c', name: 'C' },
      ]),
    };
    expect(getBacklogKey(project)).toBe('a');
    expect(getDoneKey(project)).toBe('c');
  });

  it('defaults: done is "done", backlog is "backlog"', () => {
    expect(getBacklogKey({})).toBe('backlog');
    expect(getDoneKey({})).toBe('done');
  });
});

describe('getColumnName', () => {
  it('returns the column name, or the key when unknown', () => {
    const project = { workflow: JSON.stringify([{ key: 'x', name: '保留' }]) };
    expect(getColumnName(project, 'x')).toBe('保留');
    expect(getColumnName(project, 'missing')).toBe('missing');
  });
});

describe('columnColor', () => {
  it('colours first grey, last green, middle blue', () => {
    expect(columnColor(0, 3)).toBe('#5e6c84');
    expect(columnColor(2, 3)).toBe('#0b875b');
    expect(columnColor(1, 3)).toBe('#0052cc');
  });
});
