import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import { IssueType, IssueTypeCopy, IssuePriorityCopy } from 'shared/constants/issues';
import { getColumns, getDoneKey, columnColor } from 'shared/utils/workflow';
import { color } from 'shared/utils/styles';
import { getCurrentProjectId } from 'shared/utils/currentProject';
import { IssueTypeIcon, IssuePriorityIcon } from 'shared/components';

import {
  Page,
  Title,
  SummaryRow,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
  Grid,
  DonutGrid,
  Card,
  CardTitle,
  Empty,
  BurndownCard,
  BurndownHead,
  BurndownMeta,
  Legend,
  LegendItem,
  LegendSwatch,
  DonutWrap,
  DonutLegend,
  DonutLegendItem,
  DonutSwatch,
  DonutLegendLabel,
  DonutLegendValue,
  StackChart,
  StackColumn,
  StackBar,
  StackSegment,
  StackAxis,
  StackTick,
  TableWrap,
  TRow,
  TKey,
  TType,
  TPriority,
  TSummary,
  Pagination,
  PageButton,
  PageInfo,
} from './Styles';

const typeColors = {
  [IssueType.TASK]: '#4fade6',
  [IssueType.BUG]: '#e44d42',
  [IssueType.STORY]: '#65ba43',
  [IssueType.EPIC]: '#6554c0',
};

// Palette for the assignee donut (cycled).
const PALETTE = [
  '#0052cc',
  '#00b8d9',
  '#36b37e',
  '#ff8b00',
  '#6554c0',
  '#ff5630',
  '#00875a',
  '#998dd9',
  '#ffab00',
  '#4c9aff',
];

const monthLabel = ym => moment(`${ym}-01`).format('YY/M');

// Inclusive month range across the values, capped to the last `cap` months.
const monthRange = (dates, cap = 12) => {
  const months = dates.filter(Boolean).map(d => moment(d).format('YYYY-MM'));
  if (months.length === 0) return [];
  const sorted = Array.from(new Set(months)).sort();
  const cursor = moment(`${sorted[0]}-01`);
  const end = moment(`${sorted[sorted.length - 1]}-01`);
  const out = [];
  while (cursor.isSameOrBefore(end)) {
    out.push(cursor.format('YYYY-MM'));
    cursor.add(1, 'month');
  }
  return out.slice(-cap);
};

/* ---------- Donut ---------- */
const Donut = ({ title, segments }) => {
  const active = segments.filter(s => s.value > 0);
  const total = active.reduce((sum, s) => sum + s.value, 0);
  const r = 64;
  const sw = 22;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {total === 0 ? (
        <Empty>データがありません。</Empty>
      ) : (
        <DonutWrap>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <g transform="translate(80,80) rotate(-90)">
              <circle r={r} fill="none" stroke={color.backgroundLightest} strokeWidth={sw} />
              {active.map(s => {
                const dash = (s.value / total) * C;
                const el = (
                  <circle
                    key={s.label}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={sw}
                    strokeDasharray={`${dash} ${C - dash}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += dash;
                return el;
              })}
            </g>
            <text x="80" y="76" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#172b4d">
              {total}
            </text>
            <text x="80" y="98" textAnchor="middle" fontSize="12" fill="#5e6c84">
              合計
            </text>
          </svg>
          <DonutLegend>
            {active.map(s => (
              <DonutLegendItem key={s.label}>
                <DonutSwatch swatch={s.color} />
                <DonutLegendLabel>{s.label}</DonutLegendLabel>
                <DonutLegendValue>{s.value}</DonutLegendValue>
              </DonutLegendItem>
            ))}
          </DonutLegend>
        </DonutWrap>
      )}
    </Card>
  );
};

Donut.propTypes = {
  title: PropTypes.string.isRequired,
  segments: PropTypes.array.isRequired,
};

/* ---------- Stacked bar ---------- */
const StackedBar = ({ title, months, legend }) => {
  const max = Math.max(1, ...months.map(m => m.total));
  const hasData = months.some(m => m.total > 0);
  const PLOT = 190;

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <Legend>
        {legend.map(l => (
          <LegendItem key={l.label}>
            <DonutSwatch swatch={l.color} />
            {l.label}
          </LegendItem>
        ))}
      </Legend>
      {!hasData ? (
        <Empty>データがありません。</Empty>
      ) : (
        <React.Fragment>
          <StackChart>
            {months.map(m => (
              <StackColumn key={m.key} title={`${monthLabel(m.key)}: ${m.total}`}>
                <StackBar>
                  {m.segments
                    .filter(s => s.value > 0)
                    .map(s => (
                      <StackSegment
                        key={s.label}
                        segColor={s.color}
                        h={Math.round((s.value / max) * PLOT)}
                      />
                    ))}
                </StackBar>
              </StackColumn>
            ))}
          </StackChart>
          <StackAxis>
            {months.map(m => (
              <StackTick key={m.key}>{monthLabel(m.key)}</StackTick>
            ))}
          </StackAxis>
        </React.Fragment>
      )}
    </Card>
  );
};

StackedBar.propTypes = {
  title: PropTypes.string.isRequired,
  months: PropTypes.array.isRequired,
  legend: PropTypes.array.isRequired,
};

/* ---------- Line chart ---------- */
const LineChart = ({ title, months, series, unit }) => {
  const W = 660;
  const H = 240;
  const padL = 36;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const allValues = series.flatMap(s => s.values).filter(v => v != null);
  const maxY = Math.max(1, ...allValues);
  const steps = Math.max(1, months.length - 1);
  const xAt = i => padL + (i / steps) * plotW;
  const yAt = v => padT + plotH * (1 - v / maxY);
  const hasData = months.length > 0 && allValues.some(v => v > 0);

  const yTicks = [0, maxY / 2, maxY];

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <Legend>
        {series.map(s => (
          <LegendItem key={s.label}>
            <LegendSwatch swatch={s.color} />
            {s.label}
          </LegendItem>
        ))}
      </Legend>
      {!hasData ? (
        <Empty>データがありません。</Empty>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%">
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={padL}
                y1={yAt(t)}
                x2={W - padR}
                y2={yAt(t)}
                stroke={color.borderLightest}
                strokeWidth="1"
              />
              <text x={padL - 6} y={yAt(t) + 4} textAnchor="end" fontSize="11" fill="#8993a4">
                {Math.round(t)}
              </text>
            </g>
          ))}
          {months.map((m, i) =>
            i % Math.ceil(months.length / 8 || 1) === 0 ? (
              <text key={m} x={xAt(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#8993a4">
                {monthLabel(m)}
              </text>
            ) : null,
          )}
          {series.map(s => (
            <polyline
              key={s.label}
              points={s.values.map((v, i) => `${xAt(i)},${yAt(v || 0)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
            />
          ))}
          {unit && (
            <text x={padL} y={padT - 2} fontSize="10" fill="#8993a4">
              {unit}
            </text>
          )}
        </svg>
      )}
    </Card>
  );
};

LineChart.propTypes = {
  title: PropTypes.string.isRequired,
  months: PropTypes.array.isRequired,
  series: PropTypes.array.isRequired,
  unit: PropTypes.string,
};
LineChart.defaultProps = { unit: null };

/* ---------- Detail table ---------- */
const PAGE_SIZE = 10;

const pageWindow = (current, totalPages) => {
  const pages = [];
  const from = Math.max(1, current - 2);
  const to = Math.min(totalPages, from + 4);
  for (let p = Math.max(1, to - 4); p <= to; p += 1) pages.push(p);
  return pages;
};

const DetailTable = ({ issues }) => {
  const history = useHistory();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(issues.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = issues.slice(start, start + PAGE_SIZE);

  const open = id => history.push(`/project/${getCurrentProjectId()}/board/issues/${id}`);

  if (issues.length === 0) return <Empty>作業項目がありません。</Empty>;

  return (
    <React.Fragment>
      <TableWrap>
        <TRow head>
          <TKey>キー</TKey>
          <TType>タイプ</TType>
          <TPriority>優先度</TPriority>
          <TSummary>要約</TSummary>
        </TRow>
        {rows.map(issue => (
          <TRow key={issue.id} onClick={() => open(issue.id)}>
            <TKey>{`#${issue.id}`}</TKey>
            <TType>
              <IssueTypeIcon type={issue.type} />
              <span style={{ marginLeft: 6 }}>{IssueTypeCopy[issue.type]}</span>
            </TType>
            <TPriority>
              <IssuePriorityIcon priority={issue.priority} />
              <span style={{ marginLeft: 4 }}>{IssuePriorityCopy[issue.priority]}</span>
            </TPriority>
            <TSummary>{issue.title}</TSummary>
          </TRow>
        ))}
      </TableWrap>
      <Pagination>
        <PageButton onClick={() => setPage(1)} disabled={current === 1}>
          «
        </PageButton>
        <PageButton onClick={() => setPage(current - 1)} disabled={current === 1}>
          ‹
        </PageButton>
        {pageWindow(current, totalPages).map(p => (
          <PageButton key={p} active={p === current} onClick={() => setPage(p)}>
            {p}
          </PageButton>
        ))}
        <PageButton onClick={() => setPage(current + 1)} disabled={current === totalPages}>
          ›
        </PageButton>
        <PageButton onClick={() => setPage(totalPages)} disabled={current === totalPages}>
          »
        </PageButton>
        <PageInfo>
          {start + 1}〜{Math.min(start + PAGE_SIZE, issues.length)} / {issues.length} 件
        </PageInfo>
      </Pagination>
    </React.Fragment>
  );
};

DetailTable.propTypes = {
  issues: PropTypes.array.isRequired,
};

/* ---------- Burndown (active/latest sprint) ---------- */
const pickBurndownSprint = sprints => {
  const dated = sprints.filter(s => s.startDate && s.endDate);
  const active = dated.find(s => s.status === 'active');
  if (active) return active;
  return dated.slice().sort((a, b) => b.id - a.id)[0] || null;
};

const Burndown = ({ sprint, issues, doneKey }) => {
  const start = moment(sprint.startDate).startOf('day');
  const end = moment(sprint.endDate).endOf('day');
  const sprintIssues = issues.filter(i => i.sprintId === sprint.id);

  const usePoints = sprintIssues.some(i => i.storyPoints != null);
  const unit = usePoints ? 'ポイント' : '件';
  const workOf = issue => (usePoints ? Number(issue.storyPoints) || 0 : 1);
  const scope = sprintIssues.reduce((sum, i) => sum + workOf(i), 0);

  const totalDays = Math.max(1, end.diff(start, 'days') + 1);
  const steps = Math.max(1, totalDays - 1);
  const now = moment();

  const days = [];
  for (let i = 0; i < totalDays; i += 1) {
    days.push(
      moment(start)
        .add(i, 'days')
        .endOf('day'),
    );
  }

  const completedWorkBy = dayEnd =>
    sprintIssues
      .filter(i => i.status === doneKey && moment(i.updatedAt).isSameOrBefore(dayEnd))
      .reduce((sum, i) => sum + workOf(i), 0);

  const W = 660;
  const H = 260;
  const padL = 38;
  const padR = 16;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xAt = i => padL + (steps === 0 ? 0 : (i / steps) * plotW);
  const yAt = value => padT + plotH * (1 - (scope === 0 ? 0 : value / scope));

  const idealPoints = days.map((d, i) => `${xAt(i)},${yAt(scope * (1 - i / steps))}`).join(' ');

  const actualPoints = days
    .map((d, i) => ({ i, d }))
    .filter(({ d }) => d.isSameOrBefore(now) || now.isSameOrAfter(end))
    .map(({ i, d }) => `${xAt(i)},${yAt(scope - completedWorkBy(d))}`)
    .join(' ');

  const yTicks = [0, scope / 2, scope];

  return (
    <BurndownCard>
      <BurndownHead>
        <CardTitle style={{ margin: 0 }}>バーンダウン — {sprint.name}</CardTitle>
        <BurndownMeta>
          {start.format('M/D')} 〜 {end.format('M/D')} ・ 全体 {scope} {unit}
        </BurndownMeta>
      </BurndownHead>
      <Legend>
        <LegendItem>
          <LegendSwatch swatch={color.textLight} dashed />
          理想線
        </LegendItem>
        <LegendItem>
          <LegendSwatch swatch={color.primary} />
          実績
        </LegendItem>
      </Legend>

      {scope === 0 ? (
        <Empty>このスプリントには見積もり可能な課題がありません。</Empty>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="バーンダウンチャート">
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={padL}
                y1={yAt(t)}
                x2={W - padR}
                y2={yAt(t)}
                stroke={color.borderLightest}
                strokeWidth="1"
              />
              <text x={padL - 6} y={yAt(t) + 4} textAnchor="end" fontSize="11" fill="#8993a4">
                {Math.round(t)}
              </text>
            </g>
          ))}
          <text x={padL} y={H - 8} textAnchor="middle" fontSize="11" fill="#8993a4">
            {start.format('M/D')}
          </text>
          <text x={W - padR} y={H - 8} textAnchor="end" fontSize="11" fill="#8993a4">
            {end.format('M/D')}
          </text>
          <polyline
            points={idealPoints}
            fill="none"
            stroke={color.textLight}
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {actualPoints && (
            <polyline points={actualPoints} fill="none" stroke={color.primary} strokeWidth="2.5" />
          )}
        </svg>
      )}
    </BurndownCard>
  );
};

Burndown.propTypes = {
  sprint: PropTypes.object.isRequired,
  issues: PropTypes.array.isRequired,
  doneKey: PropTypes.string.isRequired,
};

/* ---------- Main ---------- */
const propTypes = {
  project: PropTypes.object.isRequired,
};

const ProjectReports = ({ project }) => {
  const issues = project.issues || [];
  const users = project.users || [];
  const now = moment();
  const columns = getColumns(project);
  const doneKey = getDoneKey(project);
  const statusColor = key => {
    const idx = columns.findIndex(c => c.key === key);
    return columnColor(idx === -1 ? 0 : idx, columns.length);
  };

  // Stat cards
  const total = issues.length;
  const created30 = issues.filter(i =>
    moment(i.createdAt).isAfter(moment(now).subtract(30, 'days')),
  ).length;
  const done30 = issues.filter(
    i => i.status === doneKey && moment(i.updatedAt).isAfter(moment(now).subtract(30, 'days')),
  ).length;
  const incomplete = issues.filter(i => i.status !== doneKey).length;

  // Donuts
  const statusSegments = columns.map(column => ({
    label: column.name,
    value: issues.filter(i => i.status === column.key).length,
    color: statusColor(column.key),
  }));
  const typeSegments = Object.values(IssueType).map(type => ({
    label: IssueTypeCopy[type],
    value: issues.filter(i => i.type === type).length,
    color: typeColors[type],
  }));
  const assigneeSegments = [
    ...users.map((user, idx) => ({
      label: user.name,
      value: issues.filter(i => (i.userIds || []).includes(user.id)).length,
      color: PALETTE[idx % PALETTE.length],
    })),
    {
      label: '未割り当て',
      value: issues.filter(i => !i.userIds || i.userIds.length === 0).length,
      color: '#c1c7d0',
    },
  ];

  // Creation trend (stacked by status, by createdAt month)
  const createdMonths = monthRange(issues.map(i => i.createdAt));
  const creationData = createdMonths.map(key => {
    const monthIssues = issues.filter(i => moment(i.createdAt).format('YYYY-MM') === key);
    const segments = columns.map(column => ({
      label: column.name,
      color: statusColor(column.key),
      value: monthIssues.filter(i => i.status === column.key).length,
    }));
    return { key, total: monthIssues.length, segments };
  });

  // Completion trend (stacked by type, by updatedAt month of done issues)
  const doneIssues = issues.filter(i => i.status === doneKey);
  const doneMonths = monthRange(doneIssues.map(i => i.updatedAt));
  const completionData = doneMonths.map(key => {
    const monthIssues = doneIssues.filter(i => moment(i.updatedAt).format('YYYY-MM') === key);
    const segments = Object.values(IssueType).map(type => ({
      label: IssueTypeCopy[type],
      color: typeColors[type],
      value: monthIssues.filter(i => i.type === type).length,
    }));
    return { key, total: monthIssues.length, segments };
  });

  // Avg days to done (lead time proxy: updatedAt - createdAt), per completion month
  const leadMonths = doneMonths;
  const leadValues = leadMonths.map(key => {
    const monthIssues = doneIssues.filter(i => moment(i.updatedAt).format('YYYY-MM') === key);
    if (!monthIssues.length) return 0;
    const sum = monthIssues.reduce(
      (acc, i) => acc + Math.max(0, moment(i.updatedAt).diff(moment(i.createdAt), 'days')),
      0,
    );
    return Math.round((sum / monthIssues.length) * 10) / 10;
  });

  // Open (incomplete) issue count over time — cumulative created minus cumulative done
  const openMonths = monthRange([
    ...issues.map(i => i.createdAt),
    ...doneIssues.map(i => i.updatedAt),
  ]);
  const openValues = openMonths.map(key => {
    const monthEnd = moment(`${key}-01`).endOf('month');
    const createdSoFar = issues.filter(i => moment(i.createdAt).isSameOrBefore(monthEnd)).length;
    const doneSoFar = doneIssues.filter(i => moment(i.updatedAt).isSameOrBefore(monthEnd)).length;
    return Math.max(0, createdSoFar - doneSoFar);
  });

  const sortedIssues = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const burndownSprint = pickBurndownSprint(project.sprints || []);

  return (
    <Page>
      <Title>レポート</Title>

      <SummaryRow>
        <SummaryCard>
          <SummaryValue>{total}</SummaryValue>
          <SummaryLabel>作業項目（総数）</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{created30}</SummaryValue>
          <SummaryLabel>作成（過去30日）</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{done30}</SummaryValue>
          <SummaryLabel>完了（過去30日）</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{incomplete}</SummaryValue>
          <SummaryLabel>未完了</SummaryLabel>
        </SummaryCard>
      </SummaryRow>

      <DonutGrid>
        <Donut title="ステータス別の作業項目数" segments={statusSegments} />
        <Donut title="タイプ別の作業項目数" segments={typeSegments} />
        <Donut title="担当者別の作業項目数" segments={assigneeSegments} />
      </DonutGrid>

      {burndownSprint && <Burndown sprint={burndownSprint} issues={issues} doneKey={doneKey} />}

      <Grid>
        <StackedBar
          title="作業項目作成数の推移"
          months={creationData}
          legend={columns.map(column => ({
            label: column.name,
            color: statusColor(column.key),
          }))}
        />
        <StackedBar
          title="作業項目完了数の推移"
          months={completionData}
          legend={Object.values(IssueType).map(t => ({
            label: IssueTypeCopy[t],
            color: typeColors[t],
          }))}
        />
        <LineChart
          title="完了までの平均日数の推移"
          months={leadMonths}
          unit="日"
          series={[{ label: '平均日数', color: color.primary, values: leadValues }]}
        />
        <LineChart
          title="未完了（オープン）作業項目数の推移"
          months={openMonths}
          unit="件"
          series={[{ label: 'オープン', color: '#ff8b00', values: openValues }]}
        />
      </Grid>

      <CardTitle style={{ marginTop: 30 }}>作業項目の詳細</CardTitle>
      <DetailTable issues={sortedIssues} />
    </Page>
  );
};

ProjectReports.propTypes = propTypes;

export default ProjectReports;
