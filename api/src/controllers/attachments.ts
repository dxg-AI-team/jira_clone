import { pick } from 'lodash';

import { Attachment, Issue } from 'entities';
import { catchErrors, BadUserInputError } from 'errors';
import { createEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';
import { logActivity } from 'utils/activity';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const attachmentMeta = (attachment: Attachment): Partial<Attachment> =>
  pick(attachment, ['id', 'originalName', 'mimeType', 'size', 'issueId', 'userId', 'createdAt']);

export const create = catchErrors(async (req, res) => {
  const { issueId, originalName, mimeType, size } = req.body;
  // Accept either a raw base64 string or a data URL.
  const data = String(req.body.data || '').replace(/^data:[^;]+;base64,/, '');

  if (!data) {
    throw new BadUserInputError({ fields: { data: 'ファイルの内容が空です。' } });
  }
  const byteLength = Math.floor((data.length * 3) / 4);
  if (byteLength > MAX_BYTES) {
    throw new BadUserInputError({ fields: { data: 'ファイルサイズは10MBまでです。' } });
  }

  // The issue must belong to the current board.
  const issue = await findEntityOrThrow(Issue, issueId);
  if (issue.projectId !== req.projectId) {
    throw new BadUserInputError({ fields: { issueId: 'このボード内の課題を選択してください。' } });
  }

  const attachment = await createEntity(Attachment, {
    issueId,
    originalName,
    mimeType: mimeType || 'application/octet-stream',
    size: size || byteLength,
    data,
    userId: req.currentUser.id,
  });
  await logActivity(
    Number(issueId),
    req.currentUser.id,
    'attachment',
    `ファイルを添付しました: ${originalName}`,
  );
  res.respond({ attachment: attachmentMeta(attachment) });
});

// Returns the full record including base64 data so the client can rebuild the
// file as a Blob (keeps the download inside the authenticated API layer).
export const download = catchErrors(async (req, res) => {
  const attachment = await findEntityOrThrow(Attachment, req.params.attachmentId);
  res.respond({ attachment });
});

export const remove = catchErrors(async (req, res) => {
  const attachment = await deleteEntity(Attachment, req.params.attachmentId);
  res.respond({ attachment: attachmentMeta(attachment) });
});
