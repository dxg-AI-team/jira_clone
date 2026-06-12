import { getConnection } from 'typeorm';

import { Project, Space } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { findEntityOrThrow, updateEntity, createEntity } from 'utils/typeorm';
import { issuePartial } from 'serializers/issues';

const requireAdmin = (req: any): void => {
  if (req.currentUser.role !== 'admin') {
    throw new AuthorizationError('管理者のみが実行できる操作です。');
  }
};

const requireSpaceMember = (req: any, spaceId: number): void => {
  if (!(req.currentUser.spaceIds || []).includes(Number(spaceId))) {
    throw new AuthorizationError('このスペースにアクセスする権限がありません。');
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
  requireAdmin(req);
  const { name, url, description, category, icon, avatarUrl, spaceId } = req.body;
  requireSpaceMember(req, spaceId);
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
    relations: ['issues', 'versions', 'components'],
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
  res.respond({ project });
});

export const remove = catchErrors(async (req, res) => {
  requireAdmin(req);
  const projectId = Number(req.params.projectId);
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
  await connection.query('DELETE FROM issue WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM project_version WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM component WHERE "projectId" = $1', [projectId]);
  await connection.query('DELETE FROM page WHERE "projectId" = $1', [projectId]);

  const project = await findEntityOrThrow(Project, projectId);
  await Project.delete(projectId);
  res.respond({ project });
});
