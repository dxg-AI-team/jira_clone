import { Component } from 'entities';
import { catchErrors } from 'errors';
import { createEntity, updateEntity, deleteEntity } from 'utils/typeorm';

export const getProjectComponents = catchErrors(async (req, res) => {
  const components = await Component.find({
    where: { projectId: req.currentUser.projectId },
    order: { id: 'ASC' },
  });
  res.respond({ components });
});

export const create = catchErrors(async (req, res) => {
  const component = await createEntity(Component, {
    ...req.body,
    projectId: req.currentUser.projectId,
  });
  res.respond({ component });
});

export const update = catchErrors(async (req, res) => {
  const component = await updateEntity(Component, req.params.componentId, req.body);
  res.respond({ component });
});

export const remove = catchErrors(async (req, res) => {
  // The Issue<->Component join rows are removed automatically; issues remain.
  const component = await deleteEntity(Component, req.params.componentId);
  res.respond({ component });
});
