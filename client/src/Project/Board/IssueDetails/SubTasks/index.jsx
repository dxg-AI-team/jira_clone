import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useCurrentUser from 'shared/hooks/currentUser';
import { getCurrentProjectId } from 'shared/utils/currentProject';
import { IssueType, IssuePriority } from 'shared/constants/issues';
import { getDoneKey, getColumnName, columnColorForKey, getBacklogKey } from 'shared/utils/workflow';
import { Button, Select, IssueTypeIcon } from 'shared/components';

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
  Checkbox,
  RowActions,
  IconButton,
  EditInput,
  AddRow,
  AddInput,
  ConvertRow,
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
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const doneKey = getDoneKey(project);
  const backlogKey = getBacklogKey(project);
  const children = issue.children || [];
  const done = children.filter(c => c.status === doneKey).length;
  const percent = children.length === 0 ? 0 : Math.round((done / children.length) * 100);

  const goTo = id => history.push(`/project/${getCurrentProjectId()}/board/issues/${id}`);

  const updateChild = async (id, fields) => {
    try {
      await api.put(`/issues/${id}`, fields);
      await fetchIssue();
    } catch (error) {
      toast.error(error);
    }
  };

  const addSubtask = async () => {
    if (!title.trim() || !currentUser) return;
    setAdding(true);
    try {
      await api.post('/issues', {
        title: title.trim(),
        type: IssueType.SUBTASK,
        status: backlogKey,
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

  // Toggle a sub-task between the "done" column and the board's first column.
  const toggleDone = child =>
    updateChild(child.id, { status: child.status === doneKey ? backlogKey : doneKey });

  const startEdit = child => {
    setEditingId(child.id);
    setEditTitle(child.title);
  };

  const saveEdit = async child => {
    const next = editTitle.trim();
    setEditingId(null);
    if (next && next !== child.title) {
      await updateChild(child.id, { title: next });
    }
  };

  // Promote a sub-task to a standalone task (detaches it from this parent).
  const convertToTask = child => updateChild(child.id, { type: IssueType.TASK, parentId: null });

  // Convert this standalone issue into a sub-task under the chosen parent.
  const convertToSubtask = async parentId => {
    try {
      await api.put(`/issues/${issue.id}`, { type: IssueType.SUBTASK, parentId });
      await fetchIssue();
    } catch (error) {
      toast.error(error);
    }
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

  // Candidate parents for converting this issue into a sub-task.
  const parentCandidates = (project.issues || [])
    .filter(i => i.id !== issue.id && i.type !== IssueType.SUBTASK)
    .map(i => ({ value: i.id, label: i.title }));

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
            <Checkbox
              type="checkbox"
              checked={child.status === doneKey}
              onChange={() => toggleDone(child)}
              title={child.status === doneKey ? '未完了に戻す' : '完了にする'}
            />
            {editingId === child.id ? (
              <EditInput
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={() => saveEdit(child)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEdit(child);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <RowTitle done={child.status === doneKey} onClick={() => goTo(child.id)}>
                {child.title}
              </RowTitle>
            )}
            <StatusTag bg={columnColorForKey(project, child.status)}>
              {getColumnName(project, child.status)}
            </StatusTag>
            <RowActions>
              <IconButton title="名前を編集" onClick={() => startEdit(child)}>
                編集
              </IconButton>
              <IconButton title="通常の課題に変換" onClick={() => convertToTask(child)}>
                課題化
              </IconButton>
            </RowActions>
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

      {children.length === 0 && !issue.parentId && parentCandidates.length > 0 && (
        <ConvertRow>
          この課題をサブタスクに変換:
          <Select
            variant="normal"
            placeholder="親課題を選択"
            options={parentCandidates}
            onChange={convertToSubtask}
          />
        </ConvertRow>
      )}
    </Fragment>
  );
};

SubTasks.propTypes = propTypes;
SubTasks.defaultProps = defaultProps;

export default SubTasks;
