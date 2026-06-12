import {
  moveItemWithinArray,
  insertItemIntoArray,
  updateArrayItemById,
  sortByNewest,
} from './javascript';

describe('moveItemWithinArray', () => {
  it('moves an item to a new index without mutating the source', () => {
    const a = { id: 1 };
    const b = { id: 2 };
    const c = { id: 3 };
    const arr = [a, b, c];
    const result = moveItemWithinArray(arr, a, 2);
    expect(result.map(i => i.id)).toEqual([2, 3, 1]);
    expect(arr.map(i => i.id)).toEqual([1, 2, 3]); // original untouched
  });
});

describe('insertItemIntoArray', () => {
  it('inserts an item at the given index', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    const result = insertItemIntoArray(arr, { id: 9 }, 1);
    expect(result.map(i => i.id)).toEqual([1, 9, 2]);
    expect(arr).toHaveLength(2);
  });
});

describe('updateArrayItemById', () => {
  it('merges fields into the matching item', () => {
    const arr = [
      { id: 1, status: 'backlog' },
      { id: 2, status: 'done' },
    ];
    const result = updateArrayItemById(arr, 1, { status: 'inprogress' });
    expect(result[0]).toEqual({ id: 1, status: 'inprogress' });
    expect(result[1]).toEqual({ id: 2, status: 'done' });
    expect(arr[0].status).toBe('backlog'); // original untouched
  });

  it('returns a clone unchanged when the id is not found', () => {
    const arr = [{ id: 1 }];
    expect(updateArrayItemById(arr, 99, { x: 1 })).toEqual([{ id: 1 }]);
  });
});

describe('sortByNewest', () => {
  it('sorts items by a string field in descending order', () => {
    const items = [
      { id: 1, createdAt: '2026-01-01' },
      { id: 2, createdAt: '2026-03-01' },
      { id: 3, createdAt: '2026-02-01' },
    ];
    expect(sortByNewest(items, 'createdAt').map(i => i.id)).toEqual([2, 3, 1]);
  });
});
