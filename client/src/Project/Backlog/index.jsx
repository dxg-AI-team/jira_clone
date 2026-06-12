import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { formatDate } from 'shared/utils/dateTime';
import { moveItemWithinArray, insertItemIntoArray } from 'shared/utils/javascript';
import { IssueStatus } from 'shared/constants/issues';
import {
  Button,
  ConfirmModal,
  Modal,
  Form,
  IssueTypeIcon,
  IssuePriorityIcon,
} from 'shared/components';

import {
  Page,
  Header,
  Title,
  SprintCard,
  SprintHeader,
  SprintHeaderMain,
  SprintTitleRow,
  SprintName,
  StatusBadge,
  SprintMeta,
  SprintActions,
  IssueList,
  BacklogSection,
  SectionTitle,
  IssueRow,
  IssueTitle,
  Points,
  FormHeading,
  FormElement,
  Actions,
  ActionButton,
} from './Styles';

const statusMeta = {
  planned: { label: '計画中', bg: '#5E6C84' },
  active: { label: '進行中', bg: '#0052cc' },
  completed: { label: '完了', bg: '#0B875B' },
};

const sortByPos = list => [...list].sort((a, b) => a.listPosition - b.listPosition);

// listPosition for an issue dropped at `index` within an already-arranged list.
const calcPosition = (arranged, index) => {
  const prev = arranged[index - 1];
  const next = arranged[index + 1];
  if (!prev && !next) return 1;
  if (!prev) return next.listPosition - 1;
  if (!next) return prev.listPosition + 1;
  return prev.listPosition + (next.listPosition - prev.listPosition) / 2;
};

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const Backlog = ({ project, fetchProject }) => {
  const history = useHistory();
  // null = closed, {} = create, sprint = edit
  const [modalSprint, setModalSprint] = useState(null);

  const issues = project.issues || [];
  const sprints = project.sprints || [];

  const openSprints = sprints.filter(s => s.status !== 'completed');
  const completedSprints = sprints.filter(s => s.status === 'completed');
  const backlogIssues = sortByPos(issues.filter(issue => !issue.sprintId));

  const issuesOfSprint = sprintId => sortByPos(issues.filter(issue => issue.sprintId === sprintId));

  const sprintIdOf = droppableId =>
    droppableId === 'backlog' ? null : Number(droppableId.replace('sprint-', ''));

  const listOf = droppableId =>
    droppableId === 'backlog' ? backlogIssues : issuesOfSprint(sprintIdOf(droppableId));

  const onDragEnd = async ({ draggableId, source, destination }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    const issueId = Number(draggableId);
    const droppedIssue = issues.find(i => i.id === issueId);
    const destItems = listOf(destination.droppableId);
    const arranged =
      source.droppableId === destination.droppableId
        ? moveItemWithinArray(destItems, droppedIssue, destination.index)
        : insertItemIntoArray(destItems, droppedIssue, destination.index);

    try {
      await api.put(`/issues/${issueId}`, {
        sprintId: sprintIdOf(destination.droppableId),
        listPosition: calcPosition(arranged, destination.index),
      });
      await fetchProject();
    } catch (error) {
      toast.error(error);
    }
  };

  const startSprint = async sprintId => {
    try {
      await api.post(`/sprints/${sprintId}/start`);
      await fetchProject();
      toast.success('スプリントを開始しました。');
    } catch (error) {
      toast.error(error);
    }
  };

  const completeSprint = async sprintId => {
    try {
      await api.post(`/sprints/${sprintId}/complete`);
      await fetchProject();
      toast.success('スプリントを完了しました。未完了の課題はバックログに戻ります。');
    } catch (error) {
      toast.error(error);
    }
  };

  const deleteSprint = async sprintId => {
    try {
      await api.delete(`/sprints/${sprintId}`);
      await fetchProject();
      toast.success('スプリントを削除しました。課題はバックログに戻ります。');
    } catch (error) {
      toast.error(error);
    }
  };

  const renderIssueRow = (issue, index) => {
    const completed = issue.status === IssueStatus.DONE;
    return (
      <Draggable key={issue.id} draggableId={`${issue.id}`} index={index}>
        {provided => (
          <IssueRow
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <IssueTypeIcon type={issue.type} />
            <IssueTitle
              style={completed ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}
              onClick={() => history.push(`/project/${project.id}/board/issues/${issue.id}`)}
            >
              {issue.title}
            </IssueTitle>
            {issue.storyPoints != null && <Points>{issue.storyPoints}</Points>}
            <IssuePriorityIcon priority={issue.priority} />
          </IssueRow>
        )}
      </Draggable>
    );
  };

  const renderDroppableList = (droppableId, listItems, emptyText) => (
    <Droppable droppableId={droppableId}>
      {provided => (
        <IssueList ref={provided.innerRef} {...provided.droppableProps}>
          {listItems.length === 0 && (
            <IssueRow>
              <IssueTitle as="div" style={{ cursor: 'default', color: '#7a869a' }}>
                {emptyText}
              </IssueTitle>
            </IssueRow>
          )}
          {listItems.map(renderIssueRow)}
          {provided.placeholder}
        </IssueList>
      )}
    </Droppable>
  );

  const renderSprint = sprint => {
    const meta = statusMeta[sprint.status] || statusMeta.planned;
    const sprintIssues = issuesOfSprint(sprint.id);
    const dateRange =
      sprint.startDate || sprint.endDate
        ? `${sprint.startDate ? formatDate(sprint.startDate) : '—'} 〜 ${
            sprint.endDate ? formatDate(sprint.endDate) : '—'
          }`
        : null;

    return (
      <SprintCard key={sprint.id}>
        <SprintHeader>
          <SprintHeaderMain>
            <SprintTitleRow>
              <SprintName>{sprint.name}</SprintName>
              <StatusBadge bg={meta.bg}>{meta.label}</StatusBadge>
            </SprintTitleRow>
            <SprintMeta>
              {sprintIssues.length} 件の課題
              {sprint.goal ? ` ・ 目標: ${sprint.goal}` : ''}
              {dateRange ? ` ・ ${dateRange}` : ''}
            </SprintMeta>
          </SprintHeaderMain>
          <SprintActions>
            {sprint.status === 'planned' && (
              <Button variant="primary" onClick={() => startSprint(sprint.id)}>
                開始
              </Button>
            )}
            {sprint.status === 'active' && (
              <Button variant="success" onClick={() => completeSprint(sprint.id)}>
                完了
              </Button>
            )}
            <Button variant="secondary" onClick={() => setModalSprint(sprint)}>
              編集
            </Button>
            <ConfirmModal
              title="このスプリントを削除しますか？"
              message="削除しても課題は残り、バックログに戻ります。"
              confirmText="削除"
              variant="danger"
              onConfirm={({ close }) => deleteSprint(sprint.id).then(close)}
              renderLink={({ open }) => <Button variant="empty" icon="trash" onClick={open} />}
            />
          </SprintActions>
        </SprintHeader>
        {renderDroppableList(
          `sprint-${sprint.id}`,
          sprintIssues,
          '課題がありません。ここに課題をドラッグしてください。',
        )}
      </SprintCard>
    );
  };

  return (
    <Page>
      <Header>
        <Title>バックログ</Title>
        <Button variant="primary" onClick={() => setModalSprint({})}>
          スプリントを作成
        </Button>
      </Header>

      <DragDropContext onDragEnd={onDragEnd}>
        {openSprints.map(renderSprint)}

        <BacklogSection>
          <SectionTitle>
            <span>バックログ（{backlogIssues.length} 件）</span>
          </SectionTitle>
          <SprintCard>
            {renderDroppableList('backlog', backlogIssues, 'バックログに課題はありません。')}
          </SprintCard>
        </BacklogSection>

        {completedSprints.length > 0 && (
          <BacklogSection>
            <SectionTitle>
              <span>完了したスプリント</span>
            </SectionTitle>
            {completedSprints.map(renderSprint)}
          </BacklogSection>
        )}
      </DragDropContext>

      {modalSprint && (
        <Modal
          isOpen
          width={520}
          onClose={() => setModalSprint(null)}
          renderContent={modal => (
            <SprintForm
              sprint={modalSprint.id ? modalSprint : null}
              onSuccess={async () => {
                await fetchProject();
                modal.close();
                setModalSprint(null);
              }}
            />
          )}
        />
      )}
    </Page>
  );
};

const sprintFormPropTypes = {
  sprint: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

const SprintForm = ({ sprint, onSuccess }) => {
  const isEdit = !!sprint;

  return (
    <Form
      enableReinitialize
      initialValues={Form.initialValues(sprint || {}, get => ({
        name: get('name', ''),
        goal: get('goal', ''),
        startDate: get('startDate', ''),
        endDate: get('endDate', ''),
      }))}
      validations={{
        name: [Form.is.required(), Form.is.maxLength(100)],
      }}
      onSubmit={async (values, form) => {
        try {
          if (isEdit) {
            await api.put(`/sprints/${sprint.id}`, values);
            toast.success('スプリントを更新しました。');
          } else {
            await api.post('/sprints', values);
            toast.success('スプリントを作成しました。');
          }
          onSuccess();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>{isEdit ? 'スプリントを編集' : 'スプリントを作成'}</FormHeading>
        <Form.Field.Input name="name" label="名前" tip="例: スプリント 1" />
        <Form.Field.Input name="goal" label="スプリントゴール" />
        <Form.Field.DatePicker name="startDate" label="開始日" withTime={false} />
        <Form.Field.DatePicker name="endDate" label="終了日" withTime={false} />
        <Actions>
          <ActionButton type="submit" variant="primary">
            {isEdit ? '更新' : '作成'}
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

Backlog.propTypes = propTypes;
SprintForm.propTypes = sprintFormPropTypes;
SprintForm.defaultProps = { sprint: null };

export default Backlog;
