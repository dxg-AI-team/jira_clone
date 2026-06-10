import { AuthorizationError } from 'errors';

// Reads the current project id from the `X-Project-Id` header and validates that
// the authenticated user is a member of it. Must run after `authenticateUser`.
// Routes that are not project-scoped (e.g. listing/creating projects, global user
// management) simply ignore `req.projectId`.
export const selectProject = (req: any, _res: any, next: any): void => {
  try {
    const parsed = Number(req.get('X-Project-Id'));
    const projectId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

    if (projectId) {
      const projectIds = req.currentUser.projectIds || [];
      if (!projectIds.includes(projectId)) {
        throw new AuthorizationError('このプロジェクトにアクセスする権限がありません。');
      }
    }

    req.projectId = projectId;
    next();
  } catch (error) {
    next(error);
  }
};
