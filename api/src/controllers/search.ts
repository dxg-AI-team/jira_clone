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

  const issues = await Issue.createQueryBuilder('issue')
    .where('issue.projectId IN (:...boardIds)', { boardIds })
    .andWhere('(issue.title ILIKE :q OR issue.descriptionText ILIKE :q)', { q: `%${q}%` })
    .orderBy('issue.updatedAt', 'DESC')
    .take(30)
    .getMany();

  const boardName = (id: number): string => {
    const board = boards.find(b => b.id === id);
    return board ? board.name : '';
  };

  res.respond({
    issues: issues.map(i => ({
      id: i.id,
      title: i.title,
      type: i.type,
      status: i.status,
      projectId: i.projectId,
      boardName: boardName(i.projectId),
    })),
  });
});
