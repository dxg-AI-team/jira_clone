import { getConnection } from 'typeorm';

import { catchErrors, AuthorizationError } from 'errors';
import { User, Project } from 'entities';
import { createEntity, updateEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';

const requireAdmin = (req: any): void => {
  if (req.currentUser.role !== 'admin') {
    throw new AuthorizationError('管理者のみが実行できる操作です。');
  }
};

// Guard against removing/demoting the last remaining admin of the project.
const ensureNotLastAdmin = async (excludeUserId: number, projectId: number): Promise<void> => {
  const project = await findEntityOrThrow(Project, projectId, { relations: ['users'] });
  const remainingAdmins = project.users.filter(
    user => user.role === 'admin' && user.id !== excludeUserId,
  );
  if (remainingAdmins.length === 0) {
    throw new AuthorizationError('最後の管理者は降格・削除できません。');
  }
};

export const getCurrentUser = catchErrors((req, res) => {
  res.respond({ currentUser: req.currentUser });
});

export const getProjectUsers = catchErrors(async (req, res) => {
  const project = await findEntityOrThrow(Project, req.currentUser.projectId, {
    relations: ['users'],
  });
  res.respond({ users: project.users });
});

export const create = catchErrors(async (req, res) => {
  requireAdmin(req);
  const { name, email, avatarUrl, role } = req.body;

  const user = await createEntity(User, {
    name,
    email,
    avatarUrl: avatarUrl || '',
    role: role === 'admin' ? 'admin' : 'member',
    project: { id: req.currentUser.projectId },
  } as Partial<User>);

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

  // Only admins may change email and role.
  if (isAdmin && typeof req.body.email !== 'undefined') input.email = req.body.email;
  if (isAdmin && typeof req.body.role !== 'undefined' && req.body.role !== target.role) {
    if (target.role === 'admin' && req.body.role !== 'admin') {
      await ensureNotLastAdmin(targetId, req.currentUser.projectId);
    }
    input.role = req.body.role;
  }

  const user = await updateEntity(User, targetId, input);
  res.respond({ user });
});

export const remove = catchErrors(async (req, res) => {
  requireAdmin(req);
  const targetId = Number(req.params.userId);

  if (targetId === req.currentUser.id) {
    throw new AuthorizationError('自分自身のアカウントは削除できません。');
  }

  const target = await findEntityOrThrow(User, targetId);
  if (target.role === 'admin') {
    await ensureNotLastAdmin(targetId, req.currentUser.projectId);
  }

  // Remove dependent rows first (FK constraints): comments authored by the user
  // and their issue assignments. reporterId is a plain column (no FK).
  const connection = getConnection();
  await connection.query('DELETE FROM comment WHERE "userId" = $1', [targetId]);
  await connection.query('DELETE FROM issue_users_user WHERE "userId" = $1', [targetId]);

  const user = await deleteEntity(User, targetId);
  res.respond({ user });
});
