import { getConnection } from 'typeorm';

import { Project, Space } from 'entities';
import { deriveKeyFromName, ensureUniqueKey } from 'utils/projectKey';

// One-time migration for the project-key / issue-number feature: assign a unique
// key to every legacy board and a per-board sequential number to every legacy
// issue. Safe to run on every boot — it only touches rows that are still null.
export const backfillKeys = async (): Promise<void> => {
  // 0) Project (top-level) keys, unique across all projects.
  const spaces = await Space.find({ order: { id: 'ASC' } });
  const takenSpaceKeys = new Set<string>(spaces.filter(s => s.key).map(s => s.key as string));
  const spacesNeedingKey = spaces.filter(s => !s.key);
  for (const space of spacesNeedingKey) {
    const key = ensureUniqueKey(deriveKeyFromName(space.name, 'PROJ'), takenSpaceKeys);
    takenSpaceKeys.add(key);
    space.key = key;
    await space.save();
  }

  // 1) Board keys, unique within each space.
  const boards = await Project.find({ order: { id: 'ASC' } });
  const takenBySpace = new Map<number, Set<string>>();

  const takenFor = (spaceId: number): Set<string> => {
    if (!takenBySpace.has(spaceId)) takenBySpace.set(spaceId, new Set<string>());
    return takenBySpace.get(spaceId) as Set<string>;
  };

  boards.filter(b => b.key).forEach(b => takenFor(b.spaceId).add(b.key as string));

  const boardsNeedingKey = boards.filter(b => !b.key);
  for (const board of boardsNeedingKey) {
    const taken = takenFor(board.spaceId);
    const key = ensureUniqueKey(deriveKeyFromName(board.name), taken);
    taken.add(key);
    board.key = key;
    await board.save();
  }

  // 2) Issue numbers, a per-board sequence ordered by id (creation order).
  const connection = getConnection();
  const projectRows: Array<{ projectId: number }> = await connection.query(
    'SELECT DISTINCT "projectId" FROM issue WHERE "number" IS NULL',
  );

  for (const { projectId } of projectRows) {
    const maxRow: Array<{
      max: string;
    }> = await connection.query(
      'SELECT COALESCE(MAX("number"), 0) AS max FROM issue WHERE "projectId" = $1',
      [projectId],
    );
    let next = Number(maxRow[0].max) + 1;

    const issueRows: Array<{
      id: number;
    }> = await connection.query(
      'SELECT id FROM issue WHERE "projectId" = $1 AND "number" IS NULL ORDER BY id ASC',
      [projectId],
    );
    for (const { id } of issueRows) {
      await connection.query('UPDATE issue SET "number" = $1 WHERE id = $2', [next, id]);
      next += 1;
    }
  }

  if (spacesNeedingKey.length || boardsNeedingKey.length || projectRows.length) {
    console.log(
      `[backfillKeys] assigned keys to ${spacesNeedingKey.length} project(s) and ${boardsNeedingKey.length} board(s), numbered issues in ${projectRows.length} board(s).`,
    );
  }
};
