import { getConnection } from 'typeorm';

import { Page } from 'entities';
import { catchErrors } from 'errors';
import { createEntity, updateEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';
import { pagePartial } from 'serializers/pages';

export const getProjectPages = catchErrors(async (req, res) => {
  const pages = await Page.find({
    where: { projectId: req.projectId },
    order: { id: 'ASC' },
  });
  res.respond({ pages: pages.map(pagePartial) });
});

export const getPage = catchErrors(async (req, res) => {
  const page = await findEntityOrThrow(Page, req.params.pageId);
  res.respond({ page });
});

export const create = catchErrors(async (req, res) => {
  const page = await createEntity(Page, {
    ...req.body,
    projectId: req.projectId,
  });
  res.respond({ page });
});

export const update = catchErrors(async (req, res) => {
  const page = await updateEntity(Page, req.params.pageId, req.body);
  res.respond({ page });
});

export const remove = catchErrors(async (req, res) => {
  const { pageId } = req.params;
  // Re-parent any child pages to the top level so they are not orphaned.
  await getConnection().query('UPDATE page SET "parentPageId" = NULL WHERE "parentPageId" = $1', [
    pageId,
  ]);
  const page = await deleteEntity(Page, pageId);
  res.respond({ page });
});
