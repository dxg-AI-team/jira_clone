import { Project } from 'entities';
import { IssueStatus } from 'constants/issues';

interface Column {
  key: string;
  name: string;
}

interface Transitions {
  [fromKey: string]: string[];
}

const DEFAULT_COLUMNS: Column[] = [
  { key: IssueStatus.BACKLOG, name: '未着手' },
  { key: IssueStatus.SELECTED, name: '選択済み' },
  { key: IssueStatus.INPROGRESS, name: '進行中' },
  { key: IssueStatus.DONE, name: '完了' },
];

const normalizeColumns = (config: any): Column[] => {
  if (!Array.isArray(config)) return [];
  return config
    .filter((c: any) => c && c.key)
    .map((c: any) => ({ key: String(c.key), name: c.name || String(c.key) }));
};

const normalizeTransitions = (transitions: any): Transitions | null => {
  if (!transitions || typeof transitions !== 'object') return null;
  const result: Transitions = {};
  Object.keys(transitions).forEach(from => {
    if (Array.isArray(transitions[from])) result[from] = transitions[from].map(String);
  });
  return result;
};

// Parse project.workflow (JSON) into a normalized { columns, transitions }.
// Backward compatible: workflow may be a bare array of columns (legacy) or an
// object { columns, transitions }. transitions null/absent = unrestricted.
const parseWorkflow = (
  project: Project,
): { columns: Column[]; transitions: Transitions | null } => {
  if (project && project.workflow) {
    try {
      const config = JSON.parse(project.workflow);
      if (Array.isArray(config)) {
        return { columns: normalizeColumns(config), transitions: null };
      }
      if (config && typeof config === 'object') {
        return {
          columns: normalizeColumns(config.columns),
          transitions: normalizeTransitions(config.transitions),
        };
      }
    } catch (error) {
      // malformed — fall back to defaults
    }
  }
  return { columns: [], transitions: null };
};

// Ordered board columns from the project's workflow config, else defaults.
export const getColumns = (project: Project): Column[] => {
  const cols = parseWorkflow(project).columns;
  return cols.length ? cols : DEFAULT_COLUMNS;
};

// Configured transition rules, or null when transitions are unrestricted.
export const getTransitions = (project: Project): Transitions | null =>
  parseWorkflow(project).transitions;

// Whether moving an issue from `fromKey` to `toKey` is permitted. Always true
// for a no-op (same status) and when no transition rules are configured.
export const isTransitionAllowed = (project: Project, fromKey: string, toKey: string): boolean => {
  if (fromKey === toKey) return true;
  const transitions = getTransitions(project);
  if (!transitions) return true;
  return (transitions[fromKey] || []).includes(toKey);
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
