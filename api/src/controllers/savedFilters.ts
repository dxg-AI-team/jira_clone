import { SavedFilter } from 'entities';
import { catchErrors, AuthorizationError } from 'errors';
import { createEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';

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
    criteria: typeof criteria === 'string' ? criteria : JSON.stringify(criteria),
    projectId: req.projectId,
    userId: req.currentUser.id,
  });
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
