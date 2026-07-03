import { SavedFilter } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { createEntity, updateEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';

const serializeCriteria = (criteria: unknown): string =>
  typeof criteria === 'string' ? criteria : JSON.stringify(criteria);

// Saved filters are per-board and per-user.
export const getMyFilters = catchErrors(async (req, res) => {
  const savedFilters = await SavedFilter.find({
    where: { projectId: req.projectId, userId: req.currentUser.id },
    order: { createdAt: 'ASC' },
  });
  res.respond({ savedFilters });
});

export const create = catchErrors(async (req, res) => {
  const { name, criteria } = req.body;
  const savedFilter = await createEntity(SavedFilter, {
    name,
    criteria: serializeCriteria(criteria),
    projectId: req.projectId,
    userId: req.currentUser.id,
  });
  res.respond({ savedFilter });
});

export const update = catchErrors(async (req, res) => {
  const existing = await findEntityOrThrow(SavedFilter, req.params.filterId);
  if (existing.userId !== req.currentUser.id) {
    throw new AuthorizationError('このフィルターを更新する権限がありません。');
  }
  const input: { name?: string; criteria?: string } = {};
  if (req.body.name !== undefined) input.name = req.body.name;
  if (req.body.criteria !== undefined) input.criteria = serializeCriteria(req.body.criteria);
  const savedFilter = await updateEntity(SavedFilter, req.params.filterId, input);
  res.respond({ savedFilter });
});

export const remove = catchErrors(async (req, res) => {
  const existing = await findEntityOrThrow(SavedFilter, req.params.filterId);
  if (existing.userId !== req.currentUser.id) {
    throw new AuthorizationError('このフィルターを削除する権限がありません。');
  }
  const savedFilter = await deleteEntity(SavedFilter, req.params.filterId);
  res.respond({ savedFilter });
});
