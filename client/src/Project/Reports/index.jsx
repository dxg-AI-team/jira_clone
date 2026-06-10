import React from 'react';
import PropTypes from 'prop-types';

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
