import { Issue, Project, ProjectVersion, Component } from 'entities';
import { IssueType, IssueStatus, IssuePriority } from 'constants/issues';
import { catchErrors } from 'errors';
import { createEntity, findEntityOrThrow } from 'utils/typeorm';

const norm = (value: string): string =>
  (value || '')
    .toString()
    .toLowerCase()
    .trim();

const TYPE_MAP: { [key: string]: IssueType } = {
  story: IssueType.STORY,
  bug: IssueType.BUG,
  task: IssueType.TASK,
  epic: IssueType.STORY,
  'sub-task': IssueType.TASK,
  subtask: IssueType.TASK,
  ストーリー: IssueType.STORY,
  バグ: IssueType.BUG,
  タスク: IssueType.TASK,
  エピック: IssueType.STORY,
};

const STATUS_MAP: { [key: string]: IssueStatus } = {
  backlog: IssueStatus.BACKLOG,
  'to do': IssueStatus.BACKLOG,
  todo: IssueStatus.BACKLOG,
  open: IssueStatus.BACKLOG,
  new: IssueStatus.BACKLOG,
  selected: IssueStatus.SELECTED,
  'selected for development': IssueStatus.SELECTED,
  'in progress': IssueStatus.INPROGRESS,
  inprogress: IssueStatus.INPROGRESS,
  'in review': IssueStatus.INPROGRESS,
  done: IssueStatus.DONE,
  closed: IssueStatus.DONE,
  resolved: IssueStatus.DONE,
  complete: IssueStatus.DONE,
  バックログ: IssueStatus.BACKLOG,
  未着手: IssueStatus.BACKLOG,
  選択済み: IssueStatus.SELECTED,
  進行中: IssueStatus.INPROGRESS,
  完了: IssueStatus.DONE,
};

const PRIORITY_MAP: { [key: string]: IssuePriority } = {
  highest: IssuePriority.HIGHEST,
  high: IssuePriority.HIGH,
  medium: IssuePriority.MEDIUM,
  low: IssuePriority.LOW,
  lowest: IssuePriority.LOWEST,
  最高: IssuePriority.HIGHEST,
  高: IssuePriority.HIGH,
  中: IssuePriority.MEDIUM,
  低: IssuePriority.LOW,
  最低: IssuePriority.LOWEST,
};

export const importIssues = catchErrors(async (req, res) => {
  const { projectId } = req;
  const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

  const project = await findEntityOrThrow(Project, projectId, {
    relations: ['users', 'versions', 'components'],
  });

  const usersByName = new Map();
  const usersByEmail = new Map();
  project.users.forEach(user => {
    usersByName.set(norm(user.name), user);
    if (user.email) usersByEmail.set(norm(user.email), user);
  });
  const matchUser = value => {
    const key = norm(value);
    return key ? usersByEmail.get(key) || usersByName.get(key) || null : null;
  };

  const versionByName = new Map();
  project.versions.forEach(v => versionByName.set(norm(v.name), v));
  const componentByName = new Map();
  project.components.forEach(c => componentByName.set(norm(c.name), c));

  let versionsCreated = 0;
  let componentsCreated = 0;
  const unmatchedUsers = new Set();

  const getVersion = async name => {
    const key = norm(name);
    if (!key) return null;
    if (versionByName.has(key)) return versionByName.get(key);
    const version = await createEntity(ProjectVersion, { name: name.trim(), projectId });
    versionByName.set(key, version);
    versionsCreated += 1;
    return version;
  };

  const getComponent = async name => {
    const key = norm(name);
    if (!key) return null;
    if (componentByName.has(key)) return componentByName.get(key);
    const component = await createEntity(Component, { name: name.trim(), projectId });
    componentByName.set(key, component);
    componentsCreated += 1;
    return component;
  };

  const positions = {};
  Object.values(IssueStatus).forEach(s => {
    positions[s] = 0;
  });

  let created = 0;
  let skipped = 0;

  // Sequential to keep find-or-create caches consistent.
  for (const row of rows) {
    const title = (row.title || '').toString().trim();
    if (!title) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    const type = TYPE_MAP[norm(row.type)] || IssueType.TASK;
    const status = STATUS_MAP[norm(row.status)] || IssueStatus.BACKLOG;
    const priority = PRIORITY_MAP[norm(row.priority)] || IssuePriority.MEDIUM;

    const reporter = matchUser(row.reporter);
    if (row.reporter && !reporter) unmatchedUsers.add(row.reporter);

    const assigneeNames = Array.isArray(row.assignees)
      ? row.assignees
      : [row.assignee].filter(Boolean);
    const assigneeUsers = [];
    assigneeNames.forEach(a => {
      const user = matchUser(a);
      if (user) assigneeUsers.push(user);
      else if (a) unmatchedUsers.add(a);
    });

    let versionId = null;
    const versionNames = (row.versions || []).filter(Boolean);
    if (versionNames.length) {
      const version = await getVersion(versionNames[0]);
      versionId = version ? version.id : null;
    }

    const components = [];
    for (const cn of (row.components || []).filter(Boolean)) {
      const component = await getComponent(cn);
      if (component) components.push({ id: component.id });
    }

    positions[status] += 1;

    await createEntity(Issue, {
      title,
      description: row.description ? row.description.toString() : null,
      type,
      status,
      priority,
      listPosition: positions[status],
      reporterId: reporter ? reporter.id : req.currentUser.id,
      projectId,
      versionId,
      users: assigneeUsers.map(u => ({ id: u.id })),
      components,
    });
    created += 1;
  }

  res.respond({
    created,
    skipped,
    versionsCreated,
    componentsCreated,
    unmatchedUsers: [...unmatchedUsers],
  });
});
