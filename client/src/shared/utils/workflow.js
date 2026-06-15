import { IssueStatus, IssueStatusCopy } from 'shared/constants/issues';

// Default board columns (when a board has no custom workflow configured).
export const defaultColumns = () =>
  Object.values(IssueStatus).map(key => ({ key, name: IssueStatusCopy[key], wipLimit: null }));

// Ordered board columns from the project's workflow config, else the defaults.
// Workflow config shape: [{ key, name, wipLimit }] (ordered left→right).
export const getColumns = project => {
  if (project && project.workflow) {
    try {
      const config = JSON.parse(project.workflow);
      if (Array.isArray(config)) {
        const cols = config
          .filter(c => c && c.key)
          .map(c => ({ key: c.key, name: c.name || c.key, wipLimit: Number(c.wipLimit) || null }));
        if (cols.length) return cols;
      }
    } catch (error) {
      // malformed — fall back to defaults
    }
  }
  return defaultColumns();
};

// Semantics: the first column = "not started", the last column = "done".
export const getBacklogKey = project => getColumns(project)[0].key;
export const getDoneKey = project => {
  const cols = getColumns(project);
  return cols[cols.length - 1].key;
};
export const isDoneStatus = (project, status) => status === getDoneKey(project);

export const getColumnName = (project, key) => {
  const col = getColumns(project).find(c => c.key === key);
  return col ? col.name : key;
};

// Position-based colour so any column (incl. custom) gets a sensible colour:
// first = grey, last (done) = green, middle = blue.
export const columnColor = (index, total) => {
  if (index <= 0) return '#5e6c84';
  if (index >= total - 1) return '#0b875b';
  return '#0052cc';
};

export const columnColorForKey = (project, key) => {
  const cols = getColumns(project);
  const index = cols.findIndex(c => c.key === key);
  return columnColor(index === -1 ? 0 : index, cols.length);
};
