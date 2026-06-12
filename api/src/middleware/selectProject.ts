import { Project } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';

// Reads the current board id from the `X-Project-Id` header and validates that
// the authenticated user is a member of the SPACE the board belongs to. Must run
// after `authenticateUser`. Non-board-scoped routes simply ignore `req.projectId`.
export const selectProject = catchErrors(async (req, _res, next) => {
  const parsed = Number(req.get('X-Project-Id'));
  const projectId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  if (projectId) {
    const board = await Project.findOne(projectId);
    const spaceIds = req.currentUser.spaceIds || [];
    if (!board || !spaceIds.includes(board.spaceId)) {
      throw new AuthorizationError('このボードにアクセスする権限がありません。');
    }
  }

  req.projectId = projectId;
  next();
});
