import { getConnection } from 'typeorm';

import { Space, User } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { createEntity, updateEntity, findEntityOrThrow } from 'utils/typeorm';

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

const addMembership = (spaceId: number, userId: number): Promise<void> =>
  getConnection()
    .createQueryBuilder()
    .relation(Space, 'users')
    .of(spaceId)
    .add(userId);

export const getMySpaces = catchErrors(async (req, res) => {
  const ids = req.currentUser.spaceIds || [];
  const spaces = ids.length ? await Space.findByIds(ids) : [];
  res.respond({ spaces });
});

export const create = catchErrors(async (req, res) => {
  requireAdmin(req);
  const { name, icon, avatarUrl } = req.body;
  const space = await createEntity(Space, { name, icon, avatarUrl });
  await addMembership(space.id, req.currentUser.id);
  res.respond({ space });
});

export const getSpace = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  requireSpaceMember(req, spaceId);
  const space = await findEntityOrThrow(Space, spaceId, { relations: ['users', 'boards'] });
  res.respond({ space });
});

export const update = catchErrors(async (req, res) => {
  requireAdmin(req);
  const space = await updateEntity(Space, req.params.spaceId, req.body);
  res.respond({ space });
});

export const remove = catchErrors(async (req, res) => {
  requireAdmin(req);
  const spaceId = Number(req.params.spaceId);
  const connection = getConnection();

  const boards = await connection.query('SELECT id FROM project WHERE "spaceId" = $1', [spaceId]);
  // eslint-disable-next-line no-restricted-syntax
  for (const board of boards) {
    const pid = board.id;
    await connection.query(
      'DELETE FROM comment WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
      [pid],
    );
    await connection.query(
      'DELETE FROM issue_users_user WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
      [pid],
    );
    await connection.query(
      'DELETE FROM issue_components_component WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
      [pid],
    );
    await connection.query('DELETE FROM issue WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM project_version WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM component WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM page WHERE "projectId" = $1', [pid]);
  }
  await connection.query('DELETE FROM project WHERE "spaceId" = $1', [spaceId]);
  await connection.query('DELETE FROM space_users_user WHERE "spaceId" = $1', [spaceId]);

  const space = await findEntityOrThrow(Space, spaceId);
  await Space.delete(spaceId);
  res.respond({ space });
});

export const addMember = catchErrors(async (req, res) => {
  requireAdmin(req);
  const spaceId = Number(req.params.spaceId);
  const userId = Number(req.body.userId);
  const user = await findEntityOrThrow(User, userId);
  await addMembership(spaceId, userId);
  res.respond({ user });
});

export const removeMember = catchErrors(async (req, res) => {
  requireAdmin(req);
  const spaceId = Number(req.params.spaceId);
  const userId = Number(req.params.userId);
  await getConnection()
    .createQueryBuilder()
    .relation(Space, 'users')
    .of(spaceId)
    .remove(userId);
  res.respond({ userId });
});
