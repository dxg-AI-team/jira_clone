import { Issue, Project } from 'entities';
import { IssueType, IssueStatus, IssuePriority } from 'constants/issues';
import { catchErrors } from 'errors';
import { findEntityOrThrow } from 'utils/typeorm';

// Export with standard Jira-style labels so the file can be re-imported.
const TYPE_LABEL = {
  [IssueType.TASK]: 'Task',
  [IssueType.BUG]: 'Bug',
  [IssueType.STORY]: 'Story',
};
const STATUS_LABEL = {
  [IssueStatus.BACKLOG]: 'Backlog',
  [IssueStatus.SELECTED]: 'Selected for Development',
  [IssueStatus.INPROGRESS]: 'In Progress',
  [IssueStatus.DONE]: 'Done',
};
const PRIORITY_LABEL = {
  [IssuePriority.HIGHEST]: 'Highest',
  [IssuePriority.HIGH]: 'High',
  [IssuePriority.MEDIUM]: 'Medium',
  [IssuePriority.LOW]: 'Low',
  [IssuePriority.LOWEST]: 'Lowest',
};

// Returns the current project's issues in a shape ready to be turned into a
// (re-importable) CSV on the client.
export const exportIssues = catchErrors(async (req, res) => {
  const { projectId } = req;

  const project = await findEntityOrThrow(Project, projectId, {
    relations: ['users', 'versions'],
  });
  const usersById = new Map(project.users.map(user => [user.id, user]));
  const versionsById = new Map(project.versions.map(version => [version.id, version]));

  const issues = await Issue.find({
    where: { projectId },
    relations: ['users', 'components'],
    order: { id: 'ASC' },
  });

  const rows = issues.map(issue => {
    const reporter = usersById.get(issue.reporterId);
    const version = issue.versionId ? versionsById.get(issue.versionId) : null;
    return {
      title: issue.title,
      type: TYPE_LABEL[issue.type] || issue.type,
      status: STATUS_LABEL[issue.status] || issue.status,
      priority: PRIORITY_LABEL[issue.priority] || issue.priority,
      reporter: reporter ? reporter.name : '',
      assignees: (issue.users || []).map(user => user.name),
      versions: version ? [version.name] : [],
      components: (issue.components || []).map(component => component.name),
      description: issue.descriptionText || issue.description || '',
    };
  });

  res.respond({ projectName: project.name, issues: rows });
});
