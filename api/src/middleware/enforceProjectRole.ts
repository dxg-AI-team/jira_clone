import { Project, Space } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { findEntityOrThrow } from 'utils/typeorm';

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Personal actions a viewer may still perform even though they cannot edit
// project content: watching/unwatching an issue, reading their notifications,
// and managing their own saved filters.
const isPersonalWrite = (path: string): boolean =>
  /^\/issues\/\d+\/watchers(\/\d+)?$/.test(path) ||
  path.startsWith('/notifications') ||
  path.startsWith('/saved-filters');

// Read-only enforcement for the "viewer" project role. Rejects board-scoped
// content mutations by a space viewer. Global admins and space admins pass
// through; non-board requests (no X-Project-Id) are ignored here and left to
// each route's own authorization. Runs after `authenticateUser`/`selectProject`.
export const enforceProjectRole = catchErrors(async (req, _res, next) => {
  if (!WRITE_METHODS.includes(req.method) || !req.projectId) return next();
  if (req.currentUser.role === 'admin') return next();
  if (isPersonalWrite(req.path)) return next();

  const board = await findEntityOrThrow(Project, req.projectId);
  const space = await findEntityOrThrow(Space, board.spaceId);
  const isViewer = (space.viewerIds || []).includes(req.currentUser.id);
  const isSpaceAdmin = (space.adminIds || []).includes(req.currentUser.id);
  if (isViewer && !isSpaceAdmin) {
    throw new AuthorizationError('閲覧者は編集できません（読み取り専用のロールです）。');
  }
  next();
});
