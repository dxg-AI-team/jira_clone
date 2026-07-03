import { getConnection } from 'typeorm';

import { Sprint, Project } from 'entities';
import { catchErrors } from 'errors';
import { createEntity, updateEntity, deleteEntity, findEntityOrThrow } from 'utils/typeorm';
import { getDoneKey } from 'utils/workflow';

export const getProjectSprints = catchErrors(async (req, res) => {
  const sprints = await Sprint.find({
    where: { projectId: req.projectId },
    order: { id: 'ASC' },
  });
  res.respond({ sprints });
});

// Treat empty-string dates (from form fields left blank) as null so Postgres
// doesn't try to parse "" as a timestamp.
const emptyToNull = (value: unknown): unknown =>
  value === '' || value === undefined ? null : value;

export const create = catchErrors(async (req, res) => {
  const { name, goal, startDate, endDate } = req.body;
  const sprint = await createEntity(Sprint, {
    name,
    goal,
    startDate: emptyToNull(startDate),
    endDate: emptyToNull(endDate),
    status: 'planned',
    projectId: req.projectId,
  });
  res.respond({ sprint });
});

export const update = catchErrors(async (req, res) => {
  const input = { ...req.body };
  if ('startDate' in input) input.startDate = emptyToNull(input.startDate);
  if ('endDate' in input) input.endDate = emptyToNull(input.endDate);
  const sprint = await updateEntity(Sprint, req.params.sprintId, input);
  res.respond({ sprint });
});

export const remove = catchErrors(async (req, res) => {
  // Issue.sprint uses onDelete: 'SET NULL', so issues fall back to the backlog.
  const sprint = await deleteEntity(Sprint, req.params.sprintId);
  res.respond({ sprint });
});

export const start = catchErrors(async (req, res) => {
  const sprint = await findEntityOrThrow(Sprint, req.params.sprintId);
  const updated = await updateEntity(Sprint, req.params.sprintId, {
    status: 'active',
    startDate: sprint.startDate || new Date(),
    endDate: req.body.endDate || sprint.endDate,
  });
  res.respond({ sprint: updated });
});

export const complete = catchErrors(async (req, res) => {
  const sprintId = Number(req.params.sprintId);
  // Incomplete issues (not in the board's last/"done" column) return to backlog.
  const project = await findEntityOrThrow(Project, req.projectId);
  const doneKey = getDoneKey(project);
  await getConnection().query(
    'UPDATE issue SET "sprintId" = NULL WHERE "sprintId" = $1 AND status != $2',
    [sprintId, doneKey],
  );
  // Stamp the actual completion date so the sprint's end date is recorded
  // (the "period" shown in the UI otherwise had no end timestamp).
  const sprint = await updateEntity(Sprint, sprintId, {
    status: 'completed',
    endDate: new Date(),
  });
  res.respond({ sprint });
});
