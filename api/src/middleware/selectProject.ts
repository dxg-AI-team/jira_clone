import { Project } from 'entities';
import { catchErrors, AuthorizationError, EntityNotFoundError } from 'errors';

// Reads the current board id from the `X-Project-Id` header and validates that
// the authenticated user is a member of the SPACE the board belongs to. Must run
// after `authenticateUser`. Non-board-scoped routes simply ignore `req.projectId`.
export const selectProject = catchErrors(async (req, _res, next) => {
  const parsed = Number(req.get('X-Project-Id'));
  const projectId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  if (projectId) {
    const board = await Project.findOne(projectId);
    // Distinguish "board no longer exists" (e.g. deleted) from "exists but you
    // lack access", so the client can show a tailored message instead of the
    // generic error page.
    if (!board) {
      throw new EntityNotFoundError('Board');
    }
    const spaceIds = req.currentUser.spaceIds || [];
    if (!spaceIds.includes(board.spaceId)) {
      throw new AuthorizationError('このボードにアクセスする権限がありません。');
    }
  }

  req.projectId = projectId;
  next();
});
