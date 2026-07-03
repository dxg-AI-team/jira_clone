import { Project } from 'entities';
import { IssueStatus } from 'constants/issues';

interface Column {
  key: string;
  name: string;
}

const DEFAULT_COLUMNS: Column[] = [
  { key: IssueStatus.BACKLOG, name: '未着手' },
  { key: IssueStatus.SELECTED, name: '選択済み' },
  { key: IssueStatus.INPROGRESS, name: '進行中' },
  { key: IssueStatus.DONE, name: '完了' },
];

// Ordered board columns from the project's workflow config, else defaults.
export const getColumns = (project: Project): Column[] => {
  if (project && project.workflow) {
    try {
      const config = JSON.parse(project.workflow);
      if (Array.isArray(config)) {
        const cols = config
          .filter((c: any) => c && c.key)
          .map((c: any) => ({ key: String(c.key), name: c.name || String(c.key) }));
        if (cols.length) return cols;
      }
    } catch (error) {
      // malformed — fall back to defaults
    }
  }
  return DEFAULT_COLUMNS;
};

// First column = "not started", last column = "done".
export const getBacklogKey = (project: Project): string => getColumns(project)[0].key;
export const getDoneKey = (project: Project): string => {
  const cols = getColumns(project);
  return cols[cols.length - 1].key;
};

export const getColumnName = (project: Project, key: string): string => {
  const col = getColumns(project).find(c => c.key === key);
  return col ? col.name : key;
};

export const getColumnKeys = (project: Project): string[] => getColumns(project).map(c => c.key);
