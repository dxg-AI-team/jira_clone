import { pick } from 'lodash';

import { Issue, IssueLink, Attachment, ActivityLog, Project } from 'entities';
import { catchErrors } from 'errors';
import { updateEntity, deleteEntity, createEntity, findEntityOrThrow } from 'utils/typeorm';
import { notify } from 'utils/notifications';
import { logActivity } from 'utils/activity';
import { getColumnName } from 'utils/workflow';

export const getProjectIssues = catchErrors(async (req, res) => {
  const { projectId } = req;
  const { searchTerm } = req.query;

  let whereSQL = 'issue.projectId = :projectId';

  if (searchTerm) {
    whereSQL += ' AND (issue.title ILIKE :searchTerm OR issue.descriptionText ILIKE :searchTerm)';
  }

  const issues = await Issue.createQueryBuilder('issue')
    .select()
    .where(whereSQL, { projectId, searchTerm: `%${searchTerm}%` })
    .getMany();

  res.respond({ issues });
});

export const getIssueWithUsersAndComments = catchErrors(async (req, res) => {
  const issue = await findEntityOrThrow(Issue, req.params.issueId, {
    relations: ['users', 'comments', 'comments.user', 'components', 'watchers'],
  });

  // Issue links in both directions, with the linked issue's title/type.
  const links = await IssueLink.createQueryBuilder('link')
    .where('link.sourceIssueId = :id OR link.targetIssueId = :id', { id: issue.id })
    .getMany();
  const relatedIds = Array.from(
    new Set(links.flatMap(l => [l.sourceIssueId, l.targetIssueId])),
  ).filter(id => id !== issue.id);
  const related = relatedIds.length ? await Issue.findByIds(relatedIds) : [];
  const relatedById = new Map(related.map(i => [i.id, i]));

  const issueLinks = links.map(link => {
    const isSource = link.sourceIssueId === issue.id;
    const otherId = isSource ? link.targetIssueId : link.sourceIssueId;
    const other = relatedById.get(otherId);
    return {
      id: link.id,
      // Type as seen from this issue's perspective.
      type: isSource ? link.type : inverseLinkType(link.type),
      issue: other
        ? { id: other.id, title: other.title, type: other.type, status: other.status }
        : null,
    };
  });

  const attachments = (
    await Attachment.find({ where: { issueId: issue.id }, order: { createdAt: 'ASC' } })
  ).map(a => pick(a, ['id', 'originalName', 'mimeType', 'size', 'userId', 'createdAt']));

  const activity = (
    await ActivityLog.find({
      where: { issueId: issue.id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    })
  ).map(a => ({
    id: a.id,
    action: a.action,
    detail: a.detail,
    createdAt: a.createdAt,
    user: a.user ? pick(a.user, ['id', 'name', 'avatarUrl']) : null,
  }));

  // Child issues (sub-tasks) and the parent, for the hierarchy UI.
  const childIssues = await Issue.find({
    where: { parentId: issue.id },
    order: { listPosition: 'ASC' },
  });
  const children = childIssues.map(c =>
    pick(c, ['id', 'title', 'type', 'status', 'priority', 'userIds']),
  );
  let parent = null;
  if (issue.parentId) {
    const p = await Issue.findOne(issue.parentId);
    if (p) parent = pick(p, ['id', 'title', 'type', 'status']);
  }

  res.respond({ issue: { ...issue, issueLinks, attachments, activity, children, parent } });
});

export const create = catchErrors(async (req, res) => {
  const { projectId } = req;
  const listPosition = await calculateListPosition({ ...req.body, projectId });
  const issue = await createEntity(Issue, { ...req.body, projectId, listPosition });
  await logActivity(issue.id, req.currentUser.id, 'created', 'この課題を作成しました');
  res.respond({ issue });
});

export const update = catchErrors(async (req, res) => {
  // Snapshot the fields we want to detect changes on.
  const before = await findEntityOrThrow(Issue, req.params.issueId, { relations: ['watchers'] });
  const oldUserIds = before.userIds || [];
  const oldStatus = before.status;
  const watcherIds = (before.watchers || []).map(w => w.id);

  const issue = await updateEntity(Issue, req.params.issueId, req.body);

  const actorId = req.currentUser.id;
  const actorName = req.currentUser.name;

  // Newly assigned users.
  if (Array.isArray(req.body.userIds)) {
    const added = req.body.userIds.filter((id: number) => !oldUserIds.includes(id));
    await notify(added, {
      type: 'assigned',
      message: `${actorName} さんが課題「${issue.title}」をあなたに割り当てました`,
      actorId,
      issueId: issue.id,
      projectId: issue.projectId,
    });
    if (
      added.length ||
      req.body.userIds.length !== oldUserIds.length ||
      oldUserIds.some((id: number) => !req.body.userIds.includes(id))
    ) {
      await logActivity(issue.id, actorId, 'assigned', '担当者を変更しました');
    }
  }

  // Status change → watchers and assignees.
  if (req.body.status && req.body.status !== oldStatus) {
    const project = await findEntityOrThrow(Project, issue.projectId);
    const newLabel = getColumnName(project, issue.status);
    const oldLabel = getColumnName(project, oldStatus);
    const recipients = Array.from(new Set([...watcherIds, ...(issue.userIds || [])]));
    await notify(recipients, {
      type: 'status',
      message: `${actorName} さんが課題「${issue.title}」を「${newLabel}」に変更しました`,
      actorId,
      issueId: issue.id,
      projectId: issue.projectId,
    });
    await logActivity(
      issue.id,
      actorId,
      'status',
      `ステータスを「${oldLabel}」から「${newLabel}」に変更しました`,
    );
  }

  // Other notable field edits.
  if (req.body.title && req.body.title !== before.title) {
    await logActivity(issue.id, actorId, 'field', 'タイトルを変更しました');
  }
  if (req.body.priority && req.body.priority !== before.priority) {
    await logActivity(issue.id, actorId, 'field', '優先度を変更しました');
  }

  res.respond({ issue });
});

export const remove = catchErrors(async (req, res) => {
  const issue = await deleteEntity(Issue, req.params.issueId);
  res.respond({ issue });
});

// Watch / unwatch the current user.
export const addWatcher = catchErrors(async (req, res) => {
  const issue = await findEntityOrThrow(Issue, req.params.issueId, { relations: ['watchers'] });
  const userId = req.currentUser.id;
  if (!issue.watchers.some(w => w.id === userId)) {
    issue.watchers = [...issue.watchers, req.currentUser];
    await issue.save();
  }
  res.respond({ watcherIds: issue.watchers.map(w => w.id) });
});

export const removeWatcher = catchErrors(async (req, res) => {
  const issue = await findEntityOrThrow(Issue, req.params.issueId, { relations: ['watchers'] });
  const userId = Number(req.params.userId);
  issue.watchers = issue.watchers.filter(w => w.id !== userId);
  await issue.save();
  res.respond({ watcherIds: issue.watchers.map(w => w.id) });
});

const inverseLinkType = (type: string): string => {
  /* eslint-disable @typescript-eslint/camelcase */
  const map: { [key: string]: string } = {
    blocks: 'is_blocked_by',
    is_blocked_by: 'blocks',
    duplicates: 'is_duplicated_by',
    is_duplicated_by: 'duplicates',
    relates: 'relates',
  };
  /* eslint-enable @typescript-eslint/camelcase */
  return map[type] || type;
};

const calculateListPosition = async ({ projectId, status }: Issue): Promise<number> => {
  const issues = await Issue.find({ projectId, status });

  const listPositions = issues.map(({ listPosition }) => listPosition);

  if (listPositions.length > 0) {
    return Math.min(...listPositions) - 1;
  }
  return 1;
};
