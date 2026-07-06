import { IssueStatus, IssueStatusCopy } from 'shared/constants/issues';

// Default board columns (when a board has no custom workflow configured).
export const defaultColumns = () =>
  Object.values(IssueStatus).map(key => ({ key, name: IssueStatusCopy[key], wipLimit: null }));

const normalizeColumns = config => {
  if (!Array.isArray(config)) return [];
  return config
    .filter(c => c && c.key)
    .map(c => ({ key: c.key, name: c.name || c.key, wipLimit: Number(c.wipLimit) || null }));
};

// Transition rules map: { fromKey: [allowedToKey, ...] }. null = unrestricted.
const normalizeTransitions = transitions => {
  if (!transitions || typeof transitions !== 'object') return null;
  const result = {};
  Object.keys(transitions).forEach(from => {
    if (Array.isArray(transitions[from])) result[from] = transitions[from].map(String);
  });
  return result;
};

// Parse project.workflow (JSON) into a normalized { columns, transitions }.
// Backward compatible: workflow may be a bare array of columns (legacy) or an
// object { columns, transitions }. transitions null/absent = unrestricted.
const parseWorkflow = project => {
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

// Ordered board columns from the project's workflow config, else the defaults.
export const getColumns = project => {
  const cols = parseWorkflow(project).columns;
  return cols.length ? cols : defaultColumns();
};

// Configured transition rules, or null when transitions are unrestricted.
export const getTransitions = project => parseWorkflow(project).transitions;

// Whether moving an issue from `fromKey` to `toKey` is permitted. Always true
// for a no-op (same status) and when no transition rules are configured.
export const isTransitionAllowed = (project, fromKey, toKey) => {
  if (fromKey === toKey) return true;
  const transitions = getTransitions(project);
  if (!transitions) return true;
  return (transitions[fromKey] || []).includes(toKey);
};

// Allowed target statuses from `fromKey` (always includes fromKey itself).
export const getAllowedTargets = (project, fromKey) =>
  getColumns(project)
    .map(c => c.key)
    .filter(key => isTransitionAllowed(project, fromKey, key));

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
