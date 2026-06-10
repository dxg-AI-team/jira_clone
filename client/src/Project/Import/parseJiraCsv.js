import Papa from 'papaparse';

// Maps our internal field -> possible Jira CSV header names (EN + JP).
const HEADER_ALIASES = {
  title: ['summary', '概要', '要約', 'title'],
  description: ['description', '説明', '詳細'],
  type: ['issue type', 'issuetype', 'type', '課題タイプ', '種類', '種別', 'タイプ'],
  status: ['status', 'ステータス', '状態'],
  priority: ['priority', '優先度'],
  assignee: ['assignee', '担当者'],
  reporter: ['reporter', '報告者', '作成者'],
  version: ['fix version/s', 'fix versions', 'fix version', '修正バージョン', 'バージョン'],
  component: ['component/s', 'components', 'component', 'コンポーネント'],
};

const matchField = header => {
  const h = (header || '').toLowerCase().trim();
  return Object.keys(HEADER_ALIASES).find(field => HEADER_ALIASES[field].includes(h)) || null;
};

// Parse Jira CSV text into structured rows. Handles quoted/multiline fields and
// repeated columns (e.g. multiple "Component/s" or "Fix Version/s" columns).
export const parseJiraCsv = text => {
  const { data } = Papa.parse((text || '').trim(), { skipEmptyLines: true });
  if (!data.length) return { rows: [], detected: {} };

  const headers = data[0];
  const colFields = headers.map(matchField);

  const detected = {};
  colFields.forEach((field, i) => {
    if (field) detected[field] = [...(detected[field] || []), headers[i]];
  });

  const rows = data
    .slice(1)
    .map(cols => {
      const row = {
        title: '',
        description: '',
        type: '',
        status: '',
        priority: '',
        reporter: '',
        assignees: [],
        versions: [],
        components: [],
      };
      cols.forEach((raw, i) => {
        const field = colFields[i];
        const value = raw == null ? '' : `${raw}`.trim();
        if (!field || !value) return;
        if (field === 'version') row.versions.push(value);
        else if (field === 'component') row.components.push(value);
        else if (field === 'assignee') row.assignees.push(value);
        else if (!row[field]) row[field] = value;
      });
      return row;
    })
    .filter(row => row.title);

  return { rows, detected };
};
