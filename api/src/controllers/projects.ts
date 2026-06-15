import { getConnection } from 'typeorm';

import { Project, Space } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { findEntityOrThrow, updateEntity, createEntity } from 'utils/typeorm';
import { issuePartial } from 'serializers/issues';
import { getColumnKeys } from 'utils/workflow';

const requireSpaceMember = (req: any, spaceId: number): void => {
  if (!(req.currentUser.spaceIds || []).includes(Number(spaceId))) {
    throw new AuthorizationError('このスペースにアクセスする権限がありません。');
  }
};

// Board create/delete is gated on space-level admin (global admin or a member
// listed in the space's admins).
const requireSpaceAdmin = async (req: any, spaceId: number): Promise<void> => {
  requireSpaceMember(req, spaceId);
  const space = await findEntityOrThrow(Space, spaceId, { relations: ['admins'] });
  const isSpaceAdmin = (space.adminIds || []).includes(req.currentUser.id);
  if (req.currentUser.role !== 'admin' && !isSpaceAdmin) {
    throw new AuthorizationError('このスペースの管理者のみが実行できる操作です。');
  }
};

// Boards inside a space (?spaceId=).
export const getSpaceBoards = catchErrors(async (req, res) => {
  const spaceId = Number(req.query.spaceId);
  requireSpaceMember(req, spaceId);
  const boards = await Project.find({ where: { spaceId }, order: { id: 'ASC' } });
  res.respond({ boards });
});

export const create = catchErrors(async (req, res) => {
  const { name, url, description, category, icon, avatarUrl, spaceId } = req.body;
  await requireSpaceAdmin(req, spaceId);
  const project = await createEntity(Project, {
    name,
    url,
    description,
    category,
    icon,
    avatarUrl,
    spaceId,
  });
  res.respond({ project });
});

export const getProjectWithUsersAndIssues = catchErrors(async (req, res) => {
  const project = await findEntityOrThrow(Project, req.projectId, {
    relations: ['issues', 'versions', 'components', 'sprints'],
  });
  // Members live on the space the board belongs to.
  const space = await findEntityOrThrow(Space, project.spaceId, { relations: ['users'] });
  res.respond({
    project: {
      ...project,
      users: space.users,
      space: { id: space.id, name: space.name, icon: space.icon, avatarUrl: space.avatarUrl },
      issues: project.issues.map(issuePartial),
    },
  });
});

export const update = catchErrors(async (req, res) => {
  const project = await updateEntity(Project, req.projectId, req.body);

  // If the workflow (columns) changed, move any issue whose status is no longer
  // a valid column into the first column so nothing disappears from the board.
  if (req.body.workflow !== undefined) {
    const keys = getColumnKeys(project);
    await getConnection().query(
      'UPDATE issue SET status = $1 WHERE "projectId" = $2 AND NOT (status = ANY($3))',
      [keys[0], project.id, keys],
    );
  }

  res.respond({ project });
});

export const remove = catchErrors(async (req, res) => {
  const projectId = Number(req.params.projectId);
  const board = await findEntityOrThrow(Project, projectId);
  await requireSpaceAdmin(req, board.spaceId);
  const connection = getConnection();

  await connection.query(
    'DELETE FROM comment WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
    [projectId],
  );
  await connection.query(
    'DELETE FROM issue_users_user WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
    [projectId],
  );
  await connection.query(
    'DELETE FROM issue_components_component WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
    [projectId],
  );
  await connection.query(
    'DELETE FROM issue_watchers_user WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
    [projectId],
  );
  await connection.query('DELETE FROM issue WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM sprint WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM project_version WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM component WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM page WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM saved_filter WHERE "projectId" = $1', [projectId]);

  const project = await findEntityOrThrow(Project, projectId);
  await Project.delete(projectId);
  res.respond({ project });
});
