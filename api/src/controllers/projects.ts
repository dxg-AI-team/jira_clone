import { getConnection } from 'typeorm';

import { Project } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { findEntityOrThrow, updateEntity, createEntity } from 'utils/typeorm';
import { issuePartial } from 'serializers/issues';

const requireAdmin = (req: any): void => {
  if (req.currentUser.role !== 'admin') {
    throw new AuthorizationError('管理者のみが実行できる操作です。');
  }
};

export const getMyProjects = catchErrors(async (req, res) => {
  const ids = req.currentUser.projectIds || [];
  const projects = ids.length ? await Project.findByIds(ids) : [];
  res.respond({ projects });
});

export const create = catchErrors(async (req, res) => {
  requireAdmin(req);
  const { name, url, description, category } = req.body;
  const project = await createEntity(Project, { name, url, description, category });

  // The creator becomes the first member of the project.
  await getConnection()
    .createQueryBuilder()
    .relation(Project, 'users')
    .of(project.id)
    .add(req.currentUser.id);

  res.respond({ project });
});

export const getProjectWithUsersAndIssues = catchErrors(async (req, res) => {
  const project = await findEntityOrThrow(Project, req.projectId, {
    relations: ['users', 'issues', 'versions', 'components'],
  });
  res.respond({
    project: {
      ...project,
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

  // Remove all data belonging to the project before deleting it (no DB cascade).
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
  await connection.query('DELETE FROM project_users_user WHERE "projectId" = $1', [projectId]);

  const project = await findEntityOrThrow(Project, projectId);
  await Project.delete(projectId);
  res.respond({ project });
});
