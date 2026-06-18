import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { get } from 'lodash';

import useApi from 'shared/hooks/api';
import { sortByNewest } from 'shared/utils/javascript';
import { getCurrentProjectId } from 'shared/utils/currentProject';
import { formatIssueKey } from 'shared/utils/issueKey';
import { IssueTypeIcon } from 'shared/components';

import NoResultsSVG from './NoResultsSvg';
import {
  IssueSearch,
  SearchInputCont,
  SearchInputDebounced,
  SearchIcon,
  SearchSpinner,
  Issue,
  IssueData,
  IssueTitle,
  IssueTypeId,
  SectionTitle,
  NoResults,
  NoResultsTitle,
  NoResultsTip,
} from './Styles';

const propTypes = {
  project: PropTypes.object.isRequired,
};

const ProjectIssueSearch = ({ project }) => {
  const [isSearchTermEmpty, setIsSearchTermEmpty] = useState(true);

  // Global search spans every board in the user's spaces.
  const [{ data, isLoading }, fetchIssues] = useApi.get('/search', {}, { lazy: true });

  const matchingIssues = get(data, 'issues', []);

  const recentIssues = sortByNewest(project.issues, 'createdAt').slice(0, 10);

  const handleSearchChange = value => {
    const searchTerm = value.trim();

    setIsSearchTermEmpty(!searchTerm);

    if (searchTerm) {
      fetchIssues({ q: searchTerm });
    }
  };

  return (
    <IssueSearch>
      <SearchInputCont>
        <SearchInputDebounced
          autoFocus
          placeholder="概要・説明で課題を検索..."
          onChange={handleSearchChange}
        />
        <SearchIcon type="search" size={22} />
        {isLoading && <SearchSpinner />}
      </SearchInputCont>

      {isSearchTermEmpty && recentIssues.length > 0 && (
        <Fragment>
          <SectionTitle>最近の課題（このボード）</SectionTitle>
          {recentIssues.map(issue => renderIssue(issue, project.key))}
        </Fragment>
      )}

      {!isSearchTermEmpty && matchingIssues.length > 0 && (
        <Fragment>
          <SectionTitle>一致する課題（全ボード）</SectionTitle>
          {matchingIssues.map(issue => renderIssue(issue))}
        </Fragment>
      )}

      {!isSearchTermEmpty && !isLoading && matchingIssues.length === 0 && (
        <NoResults>
          <NoResultsSVG />
          <NoResultsTitle>検索条件に一致する課題が見つかりませんでした</NoResultsTitle>
          <NoResultsTip>別のキーワードで再度お試しください。</NoResultsTip>
        </NoResults>
      )}
    </IssueSearch>
  );
};

const renderIssue = (issue, fallbackKey) => (
  <Link
    key={issue.id}
    to={`/project/${issue.projectId || getCurrentProjectId()}/board/issues/${issue.id}`}
  >
    <Issue>
      <IssueTypeIcon type={issue.type} size={25} />
      <IssueData>
        <IssueTitle>{issue.title}</IssueTitle>
        <IssueTypeId>
          {formatIssueKey(issue.boardKey || fallbackKey, issue.number) ||
            `${issue.type}-${issue.id}`}
          {issue.boardName ? ` ・ ${issue.boardName}` : ''}
        </IssueTypeId>
      </IssueData>
    </Issue>
  </Link>
);

ProjectIssueSearch.propTypes = propTypes;

export default ProjectIssueSearch;
