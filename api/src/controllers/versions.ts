import { ProjectVersion } from 'entities';
import { catchErrors } from 'errors';
import { createEntity, updateEntity, deleteEntity } from 'utils/typeorm';

export const getProjectVersions = catchErrors(async (req, res) => {
  const versions = await ProjectVersion.find({
    where: { projectId: req.currentUser.projectId },
    order: { id: 'ASC' },
  });
  res.respond({ versions });
});

export const create = catchErrors(async (req, res) => {
  const version = await createEntity(ProjectVersion, {
    ...req.body,
    projectId: req.currentUser.projectId,
  });
  res.respond({ version });
});

export const update = catchErrors(async (req, res) => {
  const version = await updateEntity(ProjectVersion, req.params.versionId, req.body);
  res.respond({ version });
});

export const remove = catchErrors(async (req, res) => {
  // Issue.version uses onDelete: 'SET NULL', so deleting a version simply
  // unlinks it from any issues instead of cascading the delete.
  const version = await deleteEntity(ProjectVersion, req.params.versionId);
  res.respond({ version });
});
