import { getConnection } from 'typeorm';

import { catchErrors, AuthorizationError } from 'errors';
import { User, Project } from 'entities';
import { createEntity, updateEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';

const requireAdmin = (req: any): void => {
  if (req.currentUser.role !== 'admin') {
    throw new AuthorizationError('管理者のみが実行できる操作です。');
  }
};

// Guard against removing/demoting the last remaining admin in the whole system.
const ensureNotLastAdmin = async (excludeUserId: number): Promise<void> => {
  const adminCount = await User.count({ where: { role: 'admin' } });
  const admins = await User.find({ where: { role: 'admin' } });
  const remaining = admins.filter(u => u.id !== excludeUserId);
  if (adminCount <= 1 || remaining.length === 0) {
    throw new AuthorizationError('最後の管理者は降格・削除できません。');
  }
};

const addMembership = (projectId: number, userId: number): Promise<void> =>
  getConnection()
    .createQueryBuilder()
    .relation(Project, 'users')
    .of(projectId)
    .add(userId);

export const getCurrentUser = catchErrors((req, res) => {
  res.respond({ currentUser: req.currentUser });
});

// Members of the currently selected project.
export const getProjectUsers = catchErrors(async (req, res) => {
  const project = await findEntityOrThrow(Project, req.projectId, { relations: ['users'] });
  res.respond({ users: project.users });
});

// Create a brand-new global user and add them to the current project.
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
    await addMembership(req.projectId, user.id);
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
  await connection.query('DELETE FROM project_users_user WHERE "userId" = $1', [targetId]);

  const user = await deleteEntity(User, targetId);
  res.respond({ user });
});

// Add an existing global user as a member of the current project.
export const addMember = catchErrors(async (req, res) => {
  requireAdmin(req);
  const userId = Number(req.body.userId);
  const user = await findEntityOrThrow(User, userId);
  await addMembership(req.projectId, userId);
  res.respond({ user });
});

// Remove a member from the current project (does not delete the global user).
export const removeMember = catchErrors(async (req, res) => {
  requireAdmin(req);
  const userId = Number(req.params.userId);
  await getConnection()
    .createQueryBuilder()
    .relation(Project, 'users')
    .of(req.projectId)
    .remove(userId);
  res.respond({ userId });
});

// All global users (for picking who to add to a project).
export const getAllUsers = catchErrors(async (_req, res) => {
  const users = await User.find({ order: { id: 'ASC' } });
  res.respond({ users });
});
