import { getConnection, Not } from 'typeorm';

import { Space, User } from 'entities';
import { catchErrors, AuthorizationError, BadUserInputError } from 'errors';
import { createEntity, updateEntity, findEntityOrThrow } from 'utils/typeorm';
import { normalizeKey, isValidKey } from 'utils/projectKey';
import { sendInviteEmail } from 'utils/mail';

// Validate and normalize a project key, ensuring it is unique across all
// projects. Throws a field-level error so the form can highlight the key input.
const resolveSpaceKey = async (raw: unknown, excludeSpaceId?: number): Promise<string> => {
  const key = normalizeKey(raw);
  if (!isValidKey(key)) {
    throw new BadUserInputError({
      fields: { key: 'キーは英大文字で始まる2〜10文字の英数字で入力してください（例: ABC）。' },
    });
  }
  const where: { key: string; id?: any } = { key };
  if (excludeSpaceId) where.id = Not(excludeSpaceId);
  const existing = await Space.findOne({ where });
  if (existing) {
    throw new BadUserInputError({
      fields: { key: `キー「${key}」は既に使われています。` },
    });
  }
  return key;
};

const requireSpaceMember = (req: any, spaceId: number): void => {
  if (!(req.currentUser.spaceIds || []).includes(Number(spaceId))) {
    throw new AuthorizationError('このプロジェクトにアクセスする権限がありません。');
  }
};

// Space-level admin: a global admin (superuser) or a member listed in the
// space's `admins`. Loads the space's admins to check.
const requireSpaceAdmin = async (req: any, spaceId: number): Promise<Space> => {
  requireSpaceMember(req, spaceId);
  const space = await findEntityOrThrow(Space, spaceId, { relations: ['admins'] });
  const isSpaceAdmin = (space.adminIds || []).includes(req.currentUser.id);
  if (req.currentUser.role !== 'admin' && !isSpaceAdmin) {
    throw new AuthorizationError('このプロジェクトの管理者のみが実行できる操作です。');
  }
  return space;
};

const addToRelation = (relation: string, spaceId: number, userId: number): Promise<void> =>
  getConnection()
    .createQueryBuilder()
    .relation(Space, relation)
    .of(spaceId)
    .add(userId);

const removeFromRelation = (relation: string, spaceId: number, userId: number): Promise<void> =>
  getConnection()
    .createQueryBuilder()
    .relation(Space, relation)
    .of(spaceId)
    .remove(userId);

export const getMySpaces = catchErrors(async (req, res) => {
  const ids = req.currentUser.spaceIds || [];
  const spaces = ids.length ? await Space.findByIds(ids) : [];
  res.respond({ spaces });
});

// Space creation is limited to global admins and users granted the
// canCreateSpace permission. The creator becomes the space's first member+admin.
export const create = catchErrors(async (req, res) => {
  if (req.currentUser.role !== 'admin' && !req.currentUser.canCreateSpace) {
    throw new AuthorizationError(
      'プロジェクトを作成する権限がありません。管理者に依頼してください。',
    );
  }
  const { name, icon, avatarUrl, key } = req.body;
  const resolvedKey = await resolveSpaceKey(key);
  const space = await createEntity(Space, { name, icon, avatarUrl, key: resolvedKey });
  await addToRelation('users', space.id, req.currentUser.id);
  await addToRelation('admins', space.id, req.currentUser.id);
  res.respond({ space });
});

export const getSpace = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  requireSpaceMember(req, spaceId);
  const space = await findEntityOrThrow(Space, spaceId, {
    relations: ['users', 'admins', 'boards'],
  });
  res.respond({ space });
});

export const update = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  await requireSpaceAdmin(req, spaceId);
  if (req.body.key !== undefined) {
    req.body.key = await resolveSpaceKey(req.body.key, spaceId);
  }
  const space = await updateEntity(Space, spaceId, req.body);
  res.respond({ space });
});

export const remove = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  await requireSpaceAdmin(req, spaceId);
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
    await connection.query(
      'DELETE FROM issue_watchers_user WHERE "issueId" IN (SELECT id FROM issue WHERE "projectId" = $1)',
      [pid],
    );
    await connection.query('DELETE FROM issue WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM sprint WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM project_version WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM component WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM page WHERE "projectId" = $1', [pid]);
    await connection.query('DELETE FROM saved_filter WHERE "projectId" = $1', [pid]);
  }
  await connection.query('DELETE FROM project WHERE "spaceId" = $1', [spaceId]);
  await connection.query('DELETE FROM space_users_user WHERE "spaceId" = $1', [spaceId]);
  await connection.query('DELETE FROM space_admins_user WHERE "spaceId" = $1', [spaceId]);

  const space = await findEntityOrThrow(Space, spaceId);
  await Space.delete(spaceId);
  res.respond({ space });
});

// Parse one-or-many email addresses from an array or a delimited string
// (comma / semicolon / whitespace / newline), trimmed, de-duped (case
// insensitive) and basic-format validated.
const parseEmails = (raw: unknown): string[] => {
  if (raw == null) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(/[\s,;]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  list.forEach(item => {
    const email = String(item).trim();
    const key = email.toLowerCase();
    if (!email || seen.has(key)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    seen.add(key);
    out.push(email);
  });
  return out;
};

// Add a user to a space's members, skipping if already a member (avoids a
// junction-table unique violation on re-invite).
const addMemberIfNeeded = async (spaceId: number, userId: number): Promise<void> => {
  const alreadyMember = await Space.createQueryBuilder('s')
    .leftJoin('s.users', 'u')
    .where('s.id = :spaceId', { spaceId })
    .andWhere('u.id = :userId', { userId })
    .getCount();
  if (!alreadyMember) {
    await addToRelation('users', spaceId, userId);
  }
};

const findOrCreateByEmail = async (email: string): Promise<User> => {
  const existing = await User.createQueryBuilder('u')
    .where('LOWER(u.email) = LOWER(:email)', { email })
    .getOne();
  if (existing) return existing;
  return createEntity(User, {
    name: email,
    email,
    avatarUrl: '',
    googleId: null,
    role: 'member',
  } as Partial<User>);
};

// Add member(s) to a space. Accepts an existing { userId }, a single { email },
// or { emails } (array or delimited string) for bulk invites. Each invited
// address is pre-registered (allowlist) and emailed an invitation.
export const addMember = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  const space = await requireSpaceAdmin(req, spaceId);

  if (req.body.userId) {
    const user = await findEntityOrThrow(User, Number(req.body.userId));
    await addMemberIfNeeded(spaceId, user.id);
    const emailSent = await sendInviteEmail(user.email, space.name, req.currentUser.name);
    res.respond({
      added: 1,
      emailsSent: emailSent ? 1 : 0,
      results: [{ email: user.email, emailSent }],
    });
    return;
  }

  const emails = parseEmails(req.body.emails != null ? req.body.emails : req.body.email);
  if (emails.length === 0) {
    throw new BadUserInputError({ fields: { emails: '有効なメールアドレスを入力してください。' } });
  }

  const results = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const email of emails) {
    const user = await findOrCreateByEmail(email);
    await addMemberIfNeeded(spaceId, user.id);
    const emailSent = await sendInviteEmail(user.email, space.name, req.currentUser.name);
    results.push({ email: user.email, emailSent });
  }

  res.respond({
    added: results.length,
    emailsSent: results.filter(r => r.emailSent).length,
    results,
  });
});

export const removeMember = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  await requireSpaceAdmin(req, spaceId);
  const userId = Number(req.params.userId);
  await removeFromRelation('users', spaceId, userId);
  // A removed member can't remain a space admin.
  await removeFromRelation('admins', spaceId, userId);
  res.respond({ userId });
});

// Promote an existing member to space admin.
export const addAdmin = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  await requireSpaceAdmin(req, spaceId);
  const userId = Number(req.params.userId);

  const space = await findEntityOrThrow(Space, spaceId, { relations: ['users'] });
  if (!space.users.some(u => u.id === userId)) {
    throw new AuthorizationError('プロジェクトのメンバーのみを管理者にできます。');
  }
  await addToRelation('admins', spaceId, userId);
  res.respond({ userId });
});

// Demote a space admin back to a regular member. The last admin can't be removed.
export const removeAdmin = catchErrors(async (req, res) => {
  const spaceId = Number(req.params.spaceId);
  const space = await requireSpaceAdmin(req, spaceId);
  const userId = Number(req.params.userId);
  if ((space.adminIds || []).length <= 1 && (space.adminIds || []).includes(userId)) {
    throw new AuthorizationError('プロジェクトには少なくとも1人の管理者が必要です。');
  }
  await removeFromRelation('admins', spaceId, userId);
  res.respond({ userId });
});
