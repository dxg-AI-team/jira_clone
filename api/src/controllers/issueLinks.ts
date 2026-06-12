import { IssueLink, Issue } from 'entities';
import { catchErrors, BadUserInputError } from 'errors';
import { createEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';
import { logActivity } from 'utils/activity';

export const create = catchErrors(async (req, res) => {
  const { sourceIssueId, targetIssueId, type } = req.body;

  if (Number(sourceIssueId) === Number(targetIssueId)) {
    throw new BadUserInputError({ fields: { targetIssueId: '同じ課題はリンクできません。' } });
  }

  // Both issues must belong to the current board.
  const source = await findEntityOrThrow(Issue, sourceIssueId);
  const target = await findEntityOrThrow(Issue, targetIssueId);
  if (source.projectId !== req.projectId || target.projectId !== req.projectId) {
    throw new BadUserInputError({
      fields: { targetIssueId: 'このボード内の課題を選択してください。' },
    });
  }

  const issueLink = await createEntity(IssueLink, { sourceIssueId, targetIssueId, type });
  await logActivity(Number(sourceIssueId), req.currentUser.id, 'link', '課題リンクを追加しました');
  res.respond({ issueLink });
});

export const remove = catchErrors(async (req, res) => {
  const issueLink = await deleteEntity(IssueLink, req.params.issueLinkId);
  res.respond({ issueLink });
});
