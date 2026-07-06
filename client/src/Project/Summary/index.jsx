import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  IssueType,
  IssuePriority,
  IssueTypeCopy,
  IssuePriorityCopy,
} from 'shared/constants/issues';
import {
  getColumns,
  getDoneKey,
  getColumnName,
  columnColor,
  columnColorForKey,
} from 'shared/utils/workflow';
import { color } from 'shared/utils/styles';
import { formatDateTimeConversational } from 'shared/utils/dateTime';
import { Breadcrumbs, Icon } from 'shared/components';

import {
  Page,
  Title,
  StatRow,
  StatCard,
  StatIcon,
  StatBody,
  StatValue,
  StatLabel,
  Grid,
  Card,
  CardTitle,
  Empty,
  DonutLayout,
  DonutWrap,
  Donut,
  DonutHole,
  DonutTotal,
  DonutTotalLabel,
  Legend,
  LegendItem,
  LegendDot,
  LegendLabel,
  LegendCount,
  ChartRow,
  RowLabel,
  BarTrack,
  BarFill,
  RowCount,
  ActivityItem,
  ActivityMain,
  ActivityTitle,
  ActivityMeta,
  StatusTag,
} from './Styles';

const within7Days = date => moment(date).isAfter(moment().subtract(7, 'days'));

const propTypes = {
  project: PropTypes.object.isRequired,
};

const Bars = ({ rows }) => {
  const max = Math.max(1, ...rows.map(r => r.count));
  if (!rows.some(r => r.count > 0)) return <Empty>データがありません。</Empty>;
  return rows.map(row => (
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
  ));
};
Bars.propTypes = { rows: PropTypes.array.isRequired };

const ProjectSummary = ({ project }) => {
  const issues = project.issues || [];
  const users = project.users || [];
  const versions = project.versions || [];
  const columns = getColumns(project);
  const doneKey = getDoneKey(project);

  const total = issues.length;
  const completedLast7 = issues.filter(i => i.status === doneKey && within7Days(i.updatedAt))
    .length;
  const updatedLast7 = issues.filter(i => within7Days(i.updatedAt)).length;
  const createdLast7 = issues.filter(i => within7Days(i.createdAt)).length;
  const dueSoon = issues.filter(
    i => i.dueDate && i.status !== doneKey && moment(i.dueDate).isBefore(moment().add(7, 'days')),
  ).length;

  const stats = [
    { value: completedLast7, label: '過去 7 日間に完了', icon: 'board', bg: color.success },
    { value: updatedLast7, label: '過去 7 日間に更新', icon: 'reports', bg: color.primary },
    { value: createdLast7, label: '過去 7 日間に作成', icon: 'plus', bg: '#6554c0' },
    { value: dueSoon, label: '期限 7 日以内', icon: 'calendar', bg: '#d04437' },
  ];

  const statusData = columns.map((column, idx) => ({
    label: column.name,
    count: issues.filter(i => i.status === column.key).length,
    color: columnColor(idx, columns.length),
  }));

  const priorityRows = Object.values(IssuePriority)
    .slice()
    .reverse()
    .map(priority => ({
      label: IssuePriorityCopy[priority],
      count: issues.filter(i => i.priority === priority).length,
      color: '#d04437',
    }));

  const typeRows = Object.values(IssueType).map(type => ({
    label: IssueTypeCopy[type],
    count: issues.filter(i => i.type === type).length,
    color: color.primary,
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

  const versionRows = versions.map(version => {
    const vIssues = issues.filter(i => i.versionId === version.id);
    const done = vIssues.filter(i => i.status === doneKey).length;
    return {
      label: version.name,
      count: vIssues.length,
      done,
      percent: vIssues.length === 0 ? 0 : Math.round((done / vIssues.length) * 100),
    };
  });

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  // Donut gradient
  let acc = 0;
  const stops = [];
  statusData.forEach(d => {
    if (d.count === 0 || total === 0) return;
    const start = (acc / total) * 100;
    acc += d.count;
    const end = (acc / total) * 100;
    stops.push(`${d.color} ${start}% ${end}%`);
  });
  const donutGradient =
    total === 0 ? color.backgroundMedium : `conic-gradient(${stops.join(', ')})`;

  return (
    <Page>
      <Breadcrumbs
        items={[project.space ? project.space.name : 'プロジェクト', project.name, '要約']}
      />
      <Title>要約</Title>

      <StatRow>
        {stats.map(stat => (
          <StatCard key={stat.label}>
            <StatIcon bg={stat.bg}>
              <Icon type={stat.icon} size={20} />
            </StatIcon>
            <StatBody>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatBody>
          </StatCard>
        ))}
      </StatRow>

      <Grid>
        <Card>
          <CardTitle>ステータスの概要</CardTitle>
          <DonutLayout>
            <DonutWrap>
              <Donut gradient={donutGradient} />
              <DonutHole>
                <DonutTotal>{total}</DonutTotal>
                <DonutTotalLabel>課題の総数</DonutTotalLabel>
              </DonutHole>
            </DonutWrap>
            <Legend>
              {statusData.map(d => (
                <LegendItem key={d.label}>
                  <LegendDot dotColor={d.color} />
                  <LegendLabel>{d.label}</LegendLabel>
                  <LegendCount>{d.count}</LegendCount>
                </LegendItem>
              ))}
            </Legend>
          </DonutLayout>
        </Card>

        <Card>
          <CardTitle>最近更新された課題</CardTitle>
          {recentIssues.length === 0 ? (
            <Empty>課題がありません。</Empty>
          ) : (
            recentIssues.map(issue => (
              <ActivityItem key={issue.id}>
                <ActivityMain>
                  <ActivityTitle>{issue.title}</ActivityTitle>
                  <ActivityMeta>{formatDateTimeConversational(issue.updatedAt)}</ActivityMeta>
                </ActivityMain>
                <StatusTag
                  bg={`${columnColorForKey(project, issue.status)}22`}
                  textColor={columnColorForKey(project, issue.status)}
                >
                  {getColumnName(project, issue.status)}
                </StatusTag>
              </ActivityItem>
            ))
          )}
        </Card>

        <Card>
          <CardTitle>優先度の内訳</CardTitle>
          <Bars rows={priorityRows} />
        </Card>

        <Card>
          <CardTitle>作業のタイプ</CardTitle>
          <Bars rows={typeRows} />
        </Card>

        <Card>
          <CardTitle>チームのワークロード</CardTitle>
          <Bars rows={assigneeRows} />
        </Card>

        <Card>
          <CardTitle>リリースの進捗</CardTitle>
          {versionRows.length === 0 ? (
            <Empty>リリースがありません。</Empty>
          ) : (
            versionRows.map(row => (
              <ChartRow key={row.label}>
                <RowLabel>{row.label}</RowLabel>
                <BarTrack>
                  <BarFill count={row.done} percent={row.percent} barColor={color.success} />
                </BarTrack>
                <RowCount>{row.percent}%</RowCount>
              </ChartRow>
            ))
          )}
        </Card>
      </Grid>
    </Page>
  );
};

ProjectSummary.propTypes = propTypes;

export default ProjectSummary;
