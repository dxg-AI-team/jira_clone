import { In } from 'typeorm';

import { Issue, Project } from 'entities';
import { catchErrors } from 'errors';

// Cross-board search over every board in the user's spaces (not limited to the
// current X-Project-Id board).
export const searchIssues = catchErrors(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const spaceIds = req.currentUser.spaceIds || [];

  if (!q || spaceIds.length === 0) {
    res.respond({ issues: [] });
    return;
  }

  const boards = await Project.find({ where: { spaceId: In(spaceIds) } });
  const boardIds = boards.map(b => b.id);
  if (boardIds.length === 0) {
    res.respond({ issues: [] });
    return;
  }

  // If the query ends in digits (e.g. "ABC-12" or "12"), also match by issue number.
  const numberMatch = /(\d+)$/.exec(q);
  const num = numberMatch ? Number(numberMatch[1]) : null;

  const issues = await Issue.createQueryBuilder('issue')
    .where('issue.projectId IN (:...boardIds)', { boardIds })
    .andWhere(
      num === null
        ? '(issue.title ILIKE :q OR issue.descriptionText ILIKE :q)'
        : '(issue.title ILIKE :q OR issue.descriptionText ILIKE :q OR issue.number = :num)',
      { q: `%${q}%`, num },
    )
    .orderBy('issue.updatedAt', 'DESC')
    .take(30)
    .getMany();

  const boardById = (id: number): Project | undefined => boards.find(b => b.id === id);

  res.respond({
    issues: issues.map(i => {
      const board = boardById(i.projectId);
      return {
        id: i.id,
        number: i.number,
        title: i.title,
        type: i.type,
        status: i.status,
        projectId: i.projectId,
        boardName: board ? board.name : '',
        boardKey: board ? board.key : null,
      };
    }),
  });
});
