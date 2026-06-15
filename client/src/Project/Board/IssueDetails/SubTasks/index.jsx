import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useCurrentUser from 'shared/hooks/currentUser';
import { getCurrentProjectId } from 'shared/utils/currentProject';
import { IssueType, IssuePriority } from 'shared/constants/issues';
import { getDoneKey, getColumnName, columnColorForKey, getBacklogKey } from 'shared/utils/workflow';
import { Button, IssueTypeIcon } from 'shared/components';

import { SectionTitle } from '../Styles';
import {
  ParentBanner,
  ParentLink,
  ProgressRow,
  ProgressBar,
  ProgressFill,
  ProgressText,
  List,
  Row,
  RowTitle,
  StatusTag,
  AddRow,
  AddInput,
} from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  fetchIssue: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(['parent', 'children']),
};

const defaultProps = {
  mode: 'children',
};

const SubTasks = ({ issue, fetchIssue, project, mode }) => {
  const history = useHistory();
  const { currentUser } = useCurrentUser();
  const [title, setTitle] = useState('');
  const [isAdding, setAdding] = useState(false);

  const doneKey = getDoneKey(project);
  const children = issue.children || [];
  const done = children.filter(c => c.status === doneKey).length;
  const percent = children.length === 0 ? 0 : Math.round((done / children.length) * 100);

  const goTo = id => history.push(`/project/${getCurrentProjectId()}/board/issues/${id}`);

  const addSubtask = async () => {
    if (!title.trim() || !currentUser) return;
    setAdding(true);
    try {
      await api.post('/issues', {
        title: title.trim(),
        type: IssueType.SUBTASK,
        status: getBacklogKey(project),
        priority: IssuePriority.MEDIUM,
        reporterId: currentUser.id,
        parentId: issue.id,
        userIds: [],
      });
      setTitle('');
      await fetchIssue();
    } catch (error) {
      toast.error(error);
    }
    setAdding(false);
  };

  if (mode === 'parent') {
    if (!issue.parent) return null;
    return (
      <ParentBanner>
        <IssueTypeIcon type={issue.parent.type} />
        親課題:
        <ParentLink onClick={() => goTo(issue.parent.id)}>{issue.parent.title}</ParentLink>
      </ParentBanner>
    );
  }

  // mode === 'children': sub-tasks are not shown on a sub-task itself.
  if (issue.type === IssueType.SUBTASK) return null;

  return (
    <Fragment>
      <SectionTitle>サブタスク</SectionTitle>
      {children.length > 0 && (
        <ProgressRow>
          <ProgressBar>
            <ProgressFill percent={percent} />
          </ProgressBar>
          <ProgressText>
            {done} / {children.length} 完了（{percent}%）
          </ProgressText>
        </ProgressRow>
      )}
      <List>
        {children.map(child => (
          <Row key={child.id}>
            <IssueTypeIcon type={child.type} />
            <RowTitle done={child.status === doneKey} onClick={() => goTo(child.id)}>
              {child.title}
            </RowTitle>
            <StatusTag bg={columnColorForKey(project, child.status)}>
              {getColumnName(project, child.status)}
            </StatusTag>
          </Row>
        ))}
      </List>
      <AddRow>
        <AddInput
          placeholder="サブタスクのタイトルを入力..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSubtask()}
        />
        <Button variant="primary" isWorking={isAdding} onClick={addSubtask}>
          追加
        </Button>
      </AddRow>
    </Fragment>
  );
};

SubTasks.propTypes = propTypes;
SubTasks.defaultProps = defaultProps;

export default SubTasks;
