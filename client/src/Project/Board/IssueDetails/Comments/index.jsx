import React from 'react';
import PropTypes from 'prop-types';

import { sortByNewest } from 'shared/utils/javascript';

import Create from './Create';
import Comment from './Comment';
import { Comments, Title } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  fetchIssue: PropTypes.func.isRequired,
  mentionUsers: PropTypes.array,
};

const defaultProps = {
  mentionUsers: [],
};

const ProjectBoardIssueDetailsComments = ({ issue, fetchIssue, mentionUsers }) => (
  <Comments>
    <Title>コメント</Title>
    <Create issueId={issue.id} fetchIssue={fetchIssue} mentionUsers={mentionUsers} />

    {sortByNewest(issue.comments, 'createdAt').map(comment => (
      <Comment key={comment.id} comment={comment} fetchIssue={fetchIssue} />
    ))}
  </Comments>
);

ProjectBoardIssueDetailsComments.propTypes = propTypes;
ProjectBoardIssueDetailsComments.defaultProps = defaultProps;

export default ProjectBoardIssueDetailsComments;
