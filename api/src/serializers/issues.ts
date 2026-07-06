import { pick } from 'lodash';

import { Issue } from 'entities';

export const issuePartial = (issue: Issue): Partial<Issue> =>
  pick(issue, [
    'id',
    'number',
    'title',
    'type',
    'status',
    'priority',
    'listPosition',
    'createdAt',
    'updatedAt',
    'userIds',
    'reporterId',
    'versionId',
    'componentIds',
    'storyPoints',
    'dueDate',
    'labels',
    'parentId',
    'sprintId',
  ]);
