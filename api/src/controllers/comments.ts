import { Comment, Issue } from 'entities';
import { catchErrors } from 'errors';
import { updateEntity, deleteEntity, createEntity, findEntityOrThrow } from 'utils/typeorm';
import { notify, findMentionedUserIds } from 'utils/notifications';
import { logActivity } from 'utils/activity';

export const create = catchErrors(async (req, res) => {
  const comment = await createEntity(Comment, req.body);

  const issue = await findEntityOrThrow(Issue, comment.issueId, {
    relations: ['watchers', 'users'],
  });
  const actorId = req.currentUser.id;
  const actorName = req.currentUser.name;

  // Mentions resolve against the participants of the issue (assignees +
  // watchers) — the people whose "@Name" in a comment is meaningful here.
  const participants = [...(issue.watchers || []), ...(issue.users || [])];
  const mentioned = findMentionedUserIds(comment.body, participants);

  await notify(mentioned, {
    type: 'mention',
    message: `${actorName} さんがコメントであなたにメンションしました`,
    actorId,
    issueId: issue.id,
    projectId: issue.projectId,
  });

  const watcherIds = (issue.watchers || []).map(w => w.id).filter(id => !mentioned.includes(id));
  await notify(watcherIds, {
    type: 'comment',
    message: `${actorName} さんがウォッチ中の課題にコメントしました`,
    actorId,
    issueId: issue.id,
    projectId: issue.projectId,
  });

  await logActivity(issue.id, actorId, 'comment', 'コメントを追加しました');

  res.respond({ comment });
});

export const update = catchErrors(async (req, res) => {
  const comment = await updateEntity(Comment, req.params.commentId, req.body);
  res.respond({ comment });
});

export const remove = catchErrors(async (req, res) => {
  const comment = await deleteEntity(Comment, req.params.commentId);
  res.respond({ comment });
});
