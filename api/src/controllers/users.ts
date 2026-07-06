import { getConnection } from 'typeorm';

import { catchErrors, AuthorizationError } from 'errors';
import { User, Project, Space } from 'entities';
import { createEntity, updateEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';

const requireAdmin = (req: any): void => {
  if (req.currentUser.role !== 'admin') {
    throw new AuthorizationError('管理者のみが実行できる操作です。');
  }
};

// Members live on the space the current board belongs to.
const getSpaceIdForBoard = async (projectId: number): Promise<number> => {
  const board = await findEntityOrThrow(Project, projectId);
  return board.spaceId;
};

const addMembership = (spaceId: number, userId: number): Promise<void> =>
  getConnection()
    .createQueryBuilder()
    .relation(Space, 'users')
    .of(spaceId)
    .add(userId);

// Guard against removing/demoting the last remaining admin in the whole system.
const ensureNotLastAdmin = async (excludeUserId: number): Promise<void> => {
  const admins = await User.find({ where: { role: 'admin' } });
  const remaining = admins.filter(u => u.id !== excludeUserId);
  if (remaining.length === 0) {
    throw new AuthorizationError('最後の管理者は降格・削除できません。');
  }
};

export const getCurrentUser = catchErrors((req, res) => {
  res.respond({ currentUser: req.currentUser });
});

// Members of the space the current board belongs to.
export const getProjectUsers = catchErrors(async (req, res) => {
  const spaceId = await getSpaceIdForBoard(req.projectId);
  const space = await findEntityOrThrow(Space, spaceId, { relations: ['users'] });
  res.respond({ users: space.users });
});

// Create a brand-new global user and add them to the current board's space.
export const create = catchErrors(async (req, res) => {
  requireAdmin(req);
  const { name, email, avatarUrl, role } = req.body;

  const user = await createEntity(User, {
    name,
    email,
    avatarUrl: avatarUrl || '',
    role: role === 'admin' ? 'admin' : 'member',
  } as Partial<User>);

  if (req.projectId) {
    const spaceId = await getSpaceIdForBoard(req.projectId);
    await addMembership(spaceId, user.id);
  }

  res.respond({ user });
});

export const update = catchErrors(async (req, res) => {
  const targetId = Number(req.params.userId);
  const isAdmin = req.currentUser.role === 'admin';
  const isSelf = req.currentUser.id === targetId;

  if (!isAdmin && !isSelf) {
    throw new AuthorizationError('他のユーザーを編集する権限がありません。');
  }

  const target = await findEntityOrThrow(User, targetId);

  const input: Partial<User> = {};
  if (typeof req.body.name !== 'undefined') input.name = req.body.name;
  if (typeof req.body.avatarUrl !== 'undefined') input.avatarUrl = req.body.avatarUrl;
  if (isAdmin && typeof req.body.email !== 'undefined') input.email = req.body.email;
  if (isAdmin && typeof req.body.canCreateSpace !== 'undefined') {
    input.canCreateSpace = !!req.body.canCreateSpace;
  }
  if (isAdmin && typeof req.body.role !== 'undefined' && req.body.role !== target.role) {
    if (target.role === 'admin' && req.body.role !== 'admin') {
      await ensureNotLastAdmin(targetId);
    }
    input.role = req.body.role;
  }

  const user = await updateEntity(User, targetId, input);
  res.respond({ user });
});

// Permanently delete a global user (and all their memberships / assignments / comments).
export const remove = catchErrors(async (req, res) => {
  requireAdmin(req);
  const targetId = Number(req.params.userId);

  if (targetId === req.currentUser.id) {
    throw new AuthorizationError('自分自身のアカウントは削除できません。');
  }

  const target = await findEntityOrThrow(User, targetId);
  if (target.role === 'admin') {
    await ensureNotLastAdmin(targetId);
  }

  const connection = getConnection();
  await connection.query('DELETE FROM comment WHERE "userId" = $1', [targetId]);
  await connection.query('DELETE FROM issue_users_user WHERE "userId" = $1', [targetId]);
  await connection.query('DELETE FROM space_users_user WHERE "userId" = $1', [targetId]);
  await connection.query('DELETE FROM space_admins_user WHERE "userId" = $1', [targetId]);
  await connection.query('DELETE FROM space_viewers_user WHERE "userId" = $1', [targetId]);

  const user = await deleteEntity(User, targetId);
  res.respond({ user });
});

// Add an existing global user to the current board's space.
export const addMember = catchErrors(async (req, res) => {
  requireAdmin(req);
  const userId = Number(req.body.userId);
  const user = await findEntityOrThrow(User, userId);
  const spaceId = await getSpaceIdForBoard(req.projectId);
  await addMembership(spaceId, userId);
  res.respond({ user });
});

// Remove a member from the current board's space.
export const removeMember = catchErrors(async (req, res) => {
  requireAdmin(req);
  const userId = Number(req.params.userId);
  const spaceId = await getSpaceIdForBoard(req.projectId);
  await getConnection()
    .createQueryBuilder()
    .relation(Space, 'users')
    .of(spaceId)
    .remove(userId);
  res.respond({ userId });
});

// All global users (for picking who to add to a space).
export const getAllUsers = catchErrors(async (_req, res) => {
  const users = await User.find({ order: { id: 'ASC' } });
  res.respond({ users });
});
