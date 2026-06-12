import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  IssueType,
  IssueStatus,
  IssuePriority,
  IssueTypeCopy,
  IssueStatusCopy,
  IssuePriorityCopy,
} from 'shared/constants/issues';
import { color } from 'shared/utils/styles';

import {
  Page,
  Title,
  SummaryRow,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
  Grid,
  Card,
  CardTitle,
  ChartRow,
  RowLabel,
  BarTrack,
  BarFill,
  RowCount,
  Empty,
  BurndownCard,
  BurndownHead,
  BurndownMeta,
  Legend,
  LegendItem,
  LegendSwatch,
} from './Styles';

const statusColors = {
  [IssueStatus.BACKLOG]: '#8993a4',
  [IssueStatus.SELECTED]: '#5e6c84',
  [IssueStatus.INPROGRESS]: color.primary,
  [IssueStatus.DONE]: color.success,
};

const propTypes = {
  project: PropTypes.object.isRequired,
};

// Pick the sprint to chart: the active one, otherwise the most recently
// created sprint that has both a start and an end date.
const pickBurndownSprint = sprints => {
  const dated = sprints.filter(s => s.startDate && s.endDate);
  const active = dated.find(s => s.status === 'active');
  if (active) return active;
  return dated.slice().sort((a, b) => b.id - a.id)[0] || null;
};

// Approximate burndown. We don't snapshot remaining work daily, so the actual
// line is reconstructed from each done issue's updatedAt as a stand-in for its
// completion date. Work is measured in story points when present, else by
// issue count.
const Burndown = ({ sprint, issues }) => {
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
      .filter(i => i.status === IssueStatus.DONE && moment(i.updatedAt).isSameOrBefore(dayEnd))
      .reduce((sum, i) => sum + workOf(i), 0);

  // Geometry
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

  // Y gridlines at 0, half, full scope
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
};

const BarChart = ({ title, rows }) => {
  const max = Math.max(1, ...rows.map(r => r.count));
  const hasData = rows.some(r => r.count > 0);
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {!hasData ? (
        <Empty>データがありません。</Empty>
      ) : (
        rows.map(row => (
          <ChartRow key={row.label}>
            <RowLabel>{row.label}</RowLabel>
            <BarTrack>
              <BarFill
                count={row.count}
                percent={Math.round((row.count / max) * 100)}
                barColor={row.color}
              />
            </BarTrack>
            <RowCount>{row.count}</RowCount>
          </ChartRow>
        ))
      )}
    </Card>
  );
};

BarChart.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.array.isRequired,
};

const ProjectReports = ({ project }) => {
  const issues = project.issues || [];
  const users = project.users || [];
  const burndownSprint = pickBurndownSprint(project.sprints || []);

  const total = issues.length;
  const doneCount = issues.filter(i => i.status === IssueStatus.DONE).length;
  const inProgressCount = issues.filter(i => i.status === IssueStatus.INPROGRESS).length;
  const donePercent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const statusRows = Object.values(IssueStatus).map(status => ({
    label: IssueStatusCopy[status],
    count: issues.filter(i => i.status === status).length,
    color: statusColors[status],
  }));

  const typeRows = Object.values(IssueType).map(type => ({
    label: IssueTypeCopy[type],
    count: issues.filter(i => i.type === type).length,
    color: color.primary,
  }));

  const priorityRows = Object.values(IssuePriority)
    .slice()
    .reverse()
    .map(priority => ({
      label: IssuePriorityCopy[priority],
      count: issues.filter(i => i.priority === priority).length,
      color: '#d04437',
    }));

  const assigneeRows = [
    ...users.map(user => ({
      label: user.name,
      count: issues.filter(i => (i.userIds || []).includes(user.id)).length,
      color: color.primary,
    })),
    {
      label: '未割り当て',
      count: issues.filter(i => !i.userIds || i.userIds.length === 0).length,
      color: '#8993a4',
    },
  ];

  return (
    <Page>
      <Title>レポート</Title>

      <SummaryRow>
        <SummaryCard>
          <SummaryValue>{total}</SummaryValue>
          <SummaryLabel>課題の総数</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{inProgressCount}</SummaryValue>
          <SummaryLabel>進行中</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{doneCount}</SummaryValue>
          <SummaryLabel>完了</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{donePercent}%</SummaryValue>
          <SummaryLabel>完了率</SummaryLabel>
        </SummaryCard>
      </SummaryRow>

      {burndownSprint && <Burndown sprint={burndownSprint} issues={issues} />}

      <Grid>
        <BarChart title="ステータス別" rows={statusRows} />
        <BarChart title="種別別" rows={typeRows} />
        <BarChart title="優先度別" rows={priorityRows} />
        <BarChart title="担当者別" rows={assigneeRows} />
      </Grid>
    </Page>
  );
};

ProjectReports.propTypes = propTypes;

export default ProjectReports;
