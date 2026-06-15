import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Droppable } from 'react-beautiful-dnd';
import { intersection } from 'lodash';

import { getDoneKey } from 'shared/utils/workflow';

import Issue from './Issue';
import { List, Title, IssuesCount, WipLimit, Issues } from './Styles';

const propTypes = {
  column: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  currentUserId: PropTypes.number,
};

const defaultProps = {
  currentUserId: null,
};

const ProjectBoardList = ({ column, project, filters, currentUserId }) => {
  const status = column.key;
  const filteredIssues = filterIssues(project.issues, filters, currentUserId);
  const filteredListIssues = getSortedListIssues(filteredIssues, status);
  const allListIssues = getSortedListIssues(project.issues, status);

  const wipLimit = Number(column.wipLimit) || null;
  const overLimit = wipLimit && allListIssues.length > wipLimit;
  const doneKey = getDoneKey(project);

  return (
    <Droppable key={status} droppableId={status}>
      {provided => (
        <List>
          <Title>
            {`${column.name} `}
            <IssuesCount>{formatIssuesCount(allListIssues, filteredListIssues)}</IssuesCount>
            {wipLimit && <WipLimit over={overLimit}>{` (上限 ${wipLimit})`}</WipLimit>}
          </Title>
          <Issues
            {...provided.droppableProps}
            ref={provided.innerRef}
            data-testid={`board-list:${status}`}
          >
            {filteredListIssues.map((issue, index) => (
              <Issue
                key={issue.id}
                projectUsers={project.users}
                issue={issue}
                index={index}
                allIssues={project.issues}
                doneKey={doneKey}
              />
            ))}
            {provided.placeholder}
          </Issues>
        </List>
      )}
    </Droppable>
  );
};

const filterIssues = (projectIssues, filters, currentUserId) => {
  const { searchTerm, userIds, myOnly, recent } = filters;
  let issues = projectIssues;

  if (searchTerm) {
    issues = issues.filter(issue => issue.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (userIds.length > 0) {
    issues = issues.filter(issue => intersection(issue.userIds, userIds).length > 0);
  }
  if (myOnly && currentUserId) {
    issues = issues.filter(issue => issue.userIds.includes(currentUserId));
  }
  if (recent) {
    issues = issues.filter(issue => moment(issue.updatedAt).isAfter(moment().subtract(3, 'days')));
  }
  return issues;
};

const getSortedListIssues = (issues, status) =>
  issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

const formatIssuesCount = (allListIssues, filteredListIssues) => {
  if (allListIssues.length !== filteredListIssues.length) {
    return `${filteredListIssues.length} of ${allListIssues.length}`;
  }
  return allListIssues.length;
};

ProjectBoardList.propTypes = propTypes;
ProjectBoardList.defaultProps = defaultProps;

export default ProjectBoardList;
