import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { intersection } from 'lodash';

import {
  IssueType,
  IssueStatus,
  IssuePriority,
  IssueTypeCopy,
  IssueStatusCopy,
  IssuePriorityCopy,
} from 'shared/constants/issues';
import useMergeState from 'shared/hooks/mergeState';
import {
  InputDebounced,
  Select,
  Avatar,
  IssueTypeIcon,
  IssuePriorityIcon,
} from 'shared/components';

import {
  Page,
  Header,
  Title,
  ResultCount,
  FilterBar,
  SearchBox,
  FilterItem,
  ClearButton,
  Table,
  HeaderRow,
  Row,
  ColType,
  ColTitle,
  ColStatus,
  ColPriority,
  ColVersion,
  ColAssignees,
  StatusBadge,
  Empty,
} from './Styles';

const defaultFilters = {
  searchTerm: '',
  types: [],
  statuses: [],
  priorities: [],
  userIds: [],
  versionId: null,
  componentIds: [],
  sort: 'created-desc',
};

const statusBadgeColors = {
  [IssueStatus.BACKLOG]: { bg: '#dfe1e6', textColor: '#42526e' },
  [IssueStatus.SELECTED]: { bg: '#dfe1e6', textColor: '#42526e' },
  [IssueStatus.INPROGRESS]: { bg: '#0052cc', textColor: '#fff' },
  [IssueStatus.DONE]: { bg: '#0b875b', textColor: '#fff' },
};

const sortOptions = [
  { value: 'created-desc', label: '作成日（新しい順）' },
  { value: 'created-asc', label: '作成日（古い順）' },
  { value: 'updated-desc', label: '更新日（新しい順）' },
  { value: 'priority-desc', label: '優先度（高い順）' },
  { value: 'title-asc', label: 'タイトル（昇順）' },
];

const toOptions = (values, copy) => values.map(value => ({ value, label: copy[value] }));

const propTypes = {
  project: PropTypes.object.isRequired,
};

const ProjectIssuesAndFilters = ({ project }) => {
  const history = useHistory();
  const [filters, mergeFilters] = useMergeState(defaultFilters);

  const issues = filterAndSortIssues(project.issues || [], filters);

  const versionName = versionId => {
    const version = (project.versions || []).find(v => v.id === versionId);
    return version ? version.name : '';
  };

  const userById = id => (project.users || []).find(u => u.id === id);

  const isFiltered =
    filters.searchTerm ||
    filters.types.length ||
    filters.statuses.length ||
    filters.priorities.length ||
    filters.userIds.length ||
    filters.versionId ||
    filters.componentIds.length;

  return (
    <Page>
      <Header>
        <Title>課題とフィルター</Title>
        <ResultCount>{issues.length} 件の課題</ResultCount>
      </Header>

      <FilterBar>
        <SearchBox>
          <InputDebounced
            icon="search"
            placeholder="概要・説明で検索"
            value={filters.searchTerm}
            onChange={searchTerm => mergeFilters({ searchTerm })}
          />
        </SearchBox>
        <FilterItem>
          <Select
            isMulti
            placeholder="種別"
            value={filters.types}
            options={toOptions(Object.values(IssueType), IssueTypeCopy)}
            onChange={types => mergeFilters({ types })}
          />
        </FilterItem>
        <FilterItem>
          <Select
            isMulti
            placeholder="ステータス"
            value={filters.statuses}
            options={toOptions(Object.values(IssueStatus), IssueStatusCopy)}
            onChange={statuses => mergeFilters({ statuses })}
          />
        </FilterItem>
        <FilterItem>
          <Select
            isMulti
            placeholder="優先度"
            value={filters.priorities}
            options={toOptions(Object.values(IssuePriority), IssuePriorityCopy)}
            onChange={priorities => mergeFilters({ priorities })}
          />
        </FilterItem>
        <FilterItem>
          <Select
            isMulti
            placeholder="担当者"
            value={filters.userIds}
            options={(project.users || []).map(user => ({ value: user.id, label: user.name }))}
            onChange={userIds => mergeFilters({ userIds })}
          />
        </FilterItem>
        <FilterItem>
          <Select
            placeholder="リリース"
            value={filters.versionId || undefined}
            options={(project.versions || []).map(v => ({ value: v.id, label: v.name }))}
            onChange={versionId => mergeFilters({ versionId: versionId || null })}
          />
        </FilterItem>
        <FilterItem>
          <Select
            isMulti
            placeholder="コンポーネント"
            value={filters.componentIds}
            options={(project.components || []).map(c => ({ value: c.id, label: c.name }))}
            onChange={componentIds => mergeFilters({ componentIds })}
          />
        </FilterItem>
        <FilterItem>
          <Select
            withClearValue={false}
            value={filters.sort}
            options={sortOptions}
            onChange={sort => mergeFilters({ sort })}
          />
        </FilterItem>
        {isFiltered && (
          <ClearButton onClick={() => mergeFilters(defaultFilters)}>クリア</ClearButton>
        )}
      </FilterBar>

      {issues.length === 0 ? (
        <Empty>条件に一致する課題がありません。</Empty>
      ) : (
        <Table>
          <HeaderRow>
            <ColType />
            <ColTitle>概要</ColTitle>
            <ColStatus>ステータス</ColStatus>
            <ColPriority>優先度</ColPriority>
            <ColVersion>リリース</ColVersion>
            <ColAssignees>担当</ColAssignees>
          </HeaderRow>
          {issues.map(issue => {
            const badge = statusBadgeColors[issue.status];
            return (
              <Row
                key={issue.id}
                onClick={() => history.push(`/project/${project.id}/board/issues/${issue.id}`)}
              >
                <ColType>
                  <IssueTypeIcon type={issue.type} />
                </ColType>
                <ColTitle>{issue.title}</ColTitle>
                <ColStatus>
                  <StatusBadge bg={badge.bg} textColor={badge.textColor}>
                    {IssueStatusCopy[issue.status]}
                  </StatusBadge>
                </ColStatus>
                <ColPriority>
                  <IssuePriorityIcon priority={issue.priority} />
                </ColPriority>
                <ColVersion>{versionName(issue.versionId)}</ColVersion>
                <ColAssignees>
                  {(issue.userIds || []).map(userId => {
                    const user = userById(userId);
                    return user ? (
                      <Avatar key={userId} size={26} avatarUrl={user.avatarUrl} name={user.name} />
                    ) : null;
                  })}
                </ColAssignees>
              </Row>
            );
          })}
        </Table>
      )}
    </Page>
  );
};

const filterAndSortIssues = (allIssues, filters) => {
  const {
    searchTerm,
    types,
    statuses,
    priorities,
    userIds,
    versionId,
    componentIds,
    sort,
  } = filters;

  let issues = allIssues;

  if (searchTerm) {
    issues = issues.filter(issue => issue.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (types.length) {
    issues = issues.filter(issue => types.includes(issue.type));
  }
  if (statuses.length) {
    issues = issues.filter(issue => statuses.includes(issue.status));
  }
  if (priorities.length) {
    issues = issues.filter(issue => priorities.includes(issue.priority));
  }
  if (userIds.length) {
    issues = issues.filter(issue => intersection(issue.userIds || [], userIds).length > 0);
  }
  if (versionId) {
    issues = issues.filter(issue => issue.versionId === versionId);
  }
  if (componentIds.length) {
    issues = issues.filter(
      issue => intersection(issue.componentIds || [], componentIds).length > 0,
    );
  }

  return [...issues].sort(sorters[sort] || sorters['created-desc']);
};

const sorters = {
  'created-desc': (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'created-asc': (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  'updated-desc': (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  'priority-desc': (a, b) => Number(b.priority) - Number(a.priority),
  'title-asc': (a, b) => a.title.localeCompare(b.title),
};

ProjectIssuesAndFilters.propTypes = propTypes;

export default ProjectIssuesAndFilters;
