import React from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';

import { IssueStatus } from 'shared/constants/issues';
import { IssueTypeIcon, IssuePriorityIcon, Icon } from 'shared/components';

import {
  IssueLink,
  Issue,
  Title,
  ParentChip,
  Bottom,
  LeftMeta,
  SubtaskBadge,
  Assignees,
  AssigneeAvatar,
} from './Styles';

const propTypes = {
  projectUsers: PropTypes.array.isRequired,
  issue: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  allIssues: PropTypes.array,
};

const defaultProps = {
  allIssues: [],
};

const ProjectBoardListIssue = ({ projectUsers, issue, index, allIssues }) => {
  const match = useRouteMatch();

  const assignees = issue.userIds.map(userId => projectUsers.find(user => user.id === userId));

  const children = allIssues.filter(i => i.parentId === issue.id);
  const childrenDone = children.filter(i => i.status === IssueStatus.DONE).length;
  const parent = issue.parentId ? allIssues.find(i => i.id === issue.parentId) : null;

  return (
    <Draggable draggableId={issue.id.toString()} index={index}>
      {(provided, snapshot) => (
        <IssueLink
          to={`${match.url}/issues/${issue.id}`}
          ref={provided.innerRef}
          data-testid="list-issue"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Issue isBeingDragged={snapshot.isDragging && !snapshot.isDropAnimating}>
            {parent && (
              <ParentChip title={parent.title}>
                <IssueTypeIcon type={parent.type} size={13} />
                <span style={{ marginLeft: 5 }}>{parent.title}</span>
              </ParentChip>
            )}
            <Title>{issue.title}</Title>
            <Bottom>
              <LeftMeta>
                <IssueTypeIcon type={issue.type} />
                <IssuePriorityIcon priority={issue.priority} top={-1} left={4} />
                {children.length > 0 && (
                  <SubtaskBadge title="サブタスクの完了数">
                    <Icon type="task" size={13} />
                    <span style={{ marginLeft: 4 }}>
                      {childrenDone}/{children.length}
                    </span>
                  </SubtaskBadge>
                )}
              </LeftMeta>
              <Assignees>
                {assignees.map(user => (
                  <AssigneeAvatar
                    key={user.id}
                    size={24}
                    avatarUrl={user.avatarUrl}
                    name={user.name}
                  />
                ))}
              </Assignees>
            </Bottom>
          </Issue>
        </IssueLink>
      )}
    </Draggable>
  );
};

ProjectBoardListIssue.propTypes = propTypes;
ProjectBoardListIssue.defaultProps = defaultProps;

export default ProjectBoardListIssue;
