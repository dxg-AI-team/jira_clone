import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { formatDate } from 'shared/utils/dateTime';
import { IssueStatus } from 'shared/constants/issues';
import {
  Button,
  ConfirmModal,
  Modal,
  Form,
  Select,
  IssueTypeIcon,
  IssuePriorityIcon,
} from 'shared/components';

import {
  Page,
  Header,
  Title,
  Empty,
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
  MoveSelect,
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
  const backlogIssues = issues.filter(issue => !issue.sprintId);

  const issuesOfSprint = sprintId => issues.filter(issue => issue.sprintId === sprintId);

  const moveTargets = currentSprintId =>
    [{ value: 0, label: 'バックログ' }].concat(
      openSprints.filter(s => s.id !== currentSprintId).map(s => ({ value: s.id, label: s.name })),
    );

  const moveIssue = async (issueId, value) => {
    try {
      await api.put(`/issues/${issueId}`, { sprintId: value === 0 ? null : value });
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

  const renderIssueRow = issue => {
    const completed = issue.status === IssueStatus.DONE;
    return (
      <IssueRow key={issue.id}>
        <IssueTypeIcon type={issue.type} />
        <IssueTitle
          style={completed ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}
          onClick={() => history.push(`/project/${project.id}/board/issues/${issue.id}`)}
        >
          {issue.title}
        </IssueTitle>
        {issue.storyPoints != null && <Points>{issue.storyPoints}</Points>}
        <IssuePriorityIcon priority={issue.priority} />
        <MoveSelect>
          <Select
            variant="empty"
            withClearValue={false}
            value={issue.sprintId || 0}
            options={moveTargets(issue.sprintId || 0)}
            onChange={value => moveIssue(issue.id, value)}
          />
        </MoveSelect>
      </IssueRow>
    );
  };

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
        <IssueList>
          {sprintIssues.length === 0 ? (
            <IssueRow>
              <IssueTitle as="div" style={{ cursor: 'default', color: '#7a869a' }}>
                課題がありません。下のバックログから移動してください。
              </IssueTitle>
            </IssueRow>
          ) : (
            sprintIssues.map(renderIssueRow)
          )}
        </IssueList>
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

      {openSprints.map(renderSprint)}

      <BacklogSection>
        <SectionTitle>
          <span>バックログ（{backlogIssues.length} 件）</span>
        </SectionTitle>
        {backlogIssues.length === 0 ? (
          <Empty>バックログに課題はありません。</Empty>
        ) : (
          <SprintCard>
            <IssueList>{backlogIssues.map(renderIssueRow)}</IssueList>
          </SprintCard>
        )}
      </BacklogSection>

      {completedSprints.length > 0 && (
        <BacklogSection>
          <SectionTitle>
            <span>完了したスプリント</span>
          </SectionTitle>
          {completedSprints.map(renderSprint)}
        </BacklogSection>
      )}

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
