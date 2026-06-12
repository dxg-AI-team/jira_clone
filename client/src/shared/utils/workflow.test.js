import { parseWorkflow } from './workflow';

describe('parseWorkflow', () => {
  it('returns an empty map for a missing project or workflow', () => {
    expect(parseWorkflow(undefined)).toEqual({});
    expect(parseWorkflow(null)).toEqual({});
    expect(parseWorkflow({})).toEqual({});
    expect(parseWorkflow({ workflow: null })).toEqual({});
  });

  it('parses a valid workflow JSON array into a map keyed by status', () => {
    const project = {
      workflow: JSON.stringify([
        { status: 'inprogress', name: '開発中', wipLimit: 3 },
        { status: 'done', name: '完了済み' },
      ]),
    };
    const result = parseWorkflow(project);
    expect(result.inprogress).toEqual({ status: 'inprogress', name: '開発中', wipLimit: 3 });
    expect(result.done).toEqual({ status: 'done', name: '完了済み' });
    expect(result.backlog).toBeUndefined();
  });

  it('falls back to an empty map when the workflow JSON is malformed', () => {
    expect(parseWorkflow({ workflow: 'not json' })).toEqual({});
  });

  it('ignores non-array workflow JSON', () => {
    expect(parseWorkflow({ workflow: JSON.stringify({ status: 'x' }) })).toEqual({});
  });

  it('skips entries without a status', () => {
    const project = { workflow: JSON.stringify([{ name: 'no status' }, { status: 'done' }]) };
    expect(parseWorkflow(project)).toEqual({ done: { status: 'done' } });
  });
});
