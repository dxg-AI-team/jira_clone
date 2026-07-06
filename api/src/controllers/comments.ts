import { Comment, Issue, Project, Space } from 'entities';
import { catchErrors } from 'errors';
import { updateEntity, deleteEntity, createEntity, findEntityOrThrow } from 'utils/typeorm';
import { notify, findMentionedUserIds } from 'utils/notifications';
import { sendMentionEmail } from 'utils/mail';
import { logActivity } from 'utils/activity';

export const create = catchErrors(async (req, res) => {
  const comment = await createEntity(Comment, req.body);

  const issue = await findEntityOrThrow(Issue, comment.issueId, {
    relations: ['watchers', 'users'],
  });
  const actorId = req.currentUser.id;
  const actorName = req.currentUser.name;

  // Mentions resolve against every member of the board's space — so a comment
  // can pull in anyone on the project, not only the issue's current assignees
  // and watchers (which is the same member set the client's @-picker offers).
  const board = await findEntityOrThrow(Project, issue.projectId);
  const space = await findEntityOrThrow(Space, board.spaceId, { relations: ['users'] });
  const members = space.users || [];
  const mentioned = findMentionedUserIds(comment.body, members);

  await notify(mentioned, {
    type: 'mention',
    message: `${actorName} さんがコメントであなたにメンションしました`,
    actorId,
    issueId: issue.id,
    projectId: issue.projectId,
  });

  // Best-effort email to mentioned members (a no-op unless SMTP is configured).
  const appUrl = process.env.APP_URL || '';
  const issueUrl = `${appUrl}/project/${issue.projectId}/board/issues/${issue.id}`;
  await Promise.all(
    members
      .filter(m => mentioned.includes(m.id) && m.id !== actorId && m.email)
      .map(m => sendMentionEmail(m.email, actorName, issue.title, issueUrl)),
  );

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
