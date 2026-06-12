export const IssueType = {
  TASK: 'task',
  BUG: 'bug',
  STORY: 'story',
  EPIC: 'epic',
};

export const IssueStatus = {
  BACKLOG: 'backlog',
  SELECTED: 'selected',
  INPROGRESS: 'inprogress',
  DONE: 'done',
};

export const IssuePriority = {
  HIGHEST: '5',
  HIGH: '4',
  MEDIUM: '3',
  LOW: '2',
  LOWEST: '1',
};

export const IssueTypeCopy = {
  [IssueType.TASK]: 'タスク',
  [IssueType.BUG]: 'バグ',
  [IssueType.STORY]: 'ストーリー',
  [IssueType.EPIC]: 'エピック',
};

export const IssueStatusCopy = {
  [IssueStatus.BACKLOG]: 'バックログ',
  [IssueStatus.SELECTED]: '選択済み',
  [IssueStatus.INPROGRESS]: '進行中',
  [IssueStatus.DONE]: '完了',
};

export const IssuePriorityCopy = {
  [IssuePriority.HIGHEST]: '最高',
  [IssuePriority.HIGH]: '高',
  [IssuePriority.MEDIUM]: '中',
  [IssuePriority.LOW]: '低',
  [IssuePriority.LOWEST]: '最低',
};
