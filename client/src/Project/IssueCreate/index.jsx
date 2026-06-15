import React from 'react';
import PropTypes from 'prop-types';

import {
  IssueType,
  IssuePriority,
  IssueTypeCopy,
  IssuePriorityCopy,
} from 'shared/constants/issues';
import { getBacklogKey } from 'shared/utils/workflow';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import useCurrentUser from 'shared/hooks/currentUser';
import { Form, IssueTypeIcon, Icon, Avatar, IssuePriorityIcon } from 'shared/components';

import {
  FormHeading,
  FormElement,
  SelectItem,
  SelectItemLabel,
  Divider,
  Actions,
  ActionButton,
} from './Styles';

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
};

const ProjectIssueCreate = ({ project, fetchProject, onCreate, modalClose }) => {
  const [{ isCreating }, createIssue] = useApi.post('/issues');

  const { currentUserId } = useCurrentUser();

  return (
    <Form
      enableReinitialize
      initialValues={{
        type: IssueType.TASK,
        title: '',
        description: '',
        reporterId: currentUserId,
        userIds: [],
        priority: IssuePriority.MEDIUM,
        versionId: null,
        componentIds: [],
        storyPoints: null,
        dueDate: '',
      }}
      validations={{
        type: Form.is.required(),
        title: [Form.is.required(), Form.is.maxLength(200)],
        reporterId: Form.is.required(),
        priority: Form.is.required(),
      }}
      onSubmit={async (values, form) => {
        try {
          await createIssue({
            ...values,
            status: getBacklogKey(project),
            projectId: project.id,
            users: values.userIds.map(id => ({ id })),
            components: values.componentIds.map(id => ({ id })),
            storyPoints: values.storyPoints ? Number(values.storyPoints) : null,
            dueDate: values.dueDate || null,
          });
          await fetchProject();
          toast.success('課題を作成しました。');
          onCreate();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>課題を作成</FormHeading>
        <Form.Field.Select
          name="type"
          label="課題タイプ"
          tip="入力すると候補が表示されます。"
          options={typeOptions}
          renderOption={renderType}
          renderValue={renderType}
        />
        <Divider />
        <Form.Field.Input name="title" label="概要" tip="課題を1〜2文で簡潔にまとめてください。" />
        <Form.Field.TextEditor
          name="description"
          label="説明"
          tip="課題をできるだけ詳しく記述してください。"
        />
        <Form.Field.Select
          name="reporterId"
          label="報告者"
          options={userOptions(project)}
          renderOption={renderUser(project)}
          renderValue={renderUser(project)}
        />
        <Form.Field.Select
          isMulti
          name="userIds"
          label="担当者"
          tio="この課題に対応する担当者です。"
          options={userOptions(project)}
          renderOption={renderUser(project)}
          renderValue={renderUser(project)}
        />
        <Form.Field.Select
          name="priority"
          label="優先度"
          tip="他の課題と比較した優先度です。"
          options={priorityOptions}
          renderOption={renderPriority}
          renderValue={renderPriority}
        />
        {project.versions && project.versions.length > 0 && (
          <Form.Field.Select
            name="versionId"
            label="リリース"
            options={project.versions.map(version => ({ value: version.id, label: version.name }))}
          />
        )}
        {project.components && project.components.length > 0 && (
          <Form.Field.Select
            isMulti
            name="componentIds"
            label="コンポーネント"
            options={project.components.map(component => ({
              value: component.id,
              label: component.name,
            }))}
          />
        )}
        <Form.Field.Input name="storyPoints" label="ストーリーポイント" />
        <Form.Field.DatePicker name="dueDate" label="期日" withTime={false} />
        <Actions>
          <ActionButton type="submit" variant="primary" isWorking={isCreating}>
            課題を作成
          </ActionButton>
          <ActionButton type="button" variant="empty" onClick={modalClose}>
            キャンセル
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

const typeOptions = Object.values(IssueType).map(type => ({
  value: type,
  label: IssueTypeCopy[type],
}));

const priorityOptions = Object.values(IssuePriority).map(priority => ({
  value: priority,
  label: IssuePriorityCopy[priority],
}));

const userOptions = project => project.users.map(user => ({ value: user.id, label: user.name }));

const renderType = ({ value: type }) => (
  <SelectItem>
    <IssueTypeIcon type={type} top={1} />
    <SelectItemLabel>{IssueTypeCopy[type]}</SelectItemLabel>
  </SelectItem>
);

const renderPriority = ({ value: priority }) => (
  <SelectItem>
    <IssuePriorityIcon priority={priority} top={1} />
    <SelectItemLabel>{IssuePriorityCopy[priority]}</SelectItemLabel>
  </SelectItem>
);

const renderUser = project => ({ value: userId, removeOptionValue }) => {
  const user = project.users.find(({ id }) => id === userId);

  return (
    <SelectItem
      key={user.id}
      withBottomMargin={!!removeOptionValue}
      onClick={() => removeOptionValue && removeOptionValue()}
    >
      <Avatar size={20} avatarUrl={user.avatarUrl} name={user.name} />
      <SelectItemLabel>{user.name}</SelectItemLabel>
      {removeOptionValue && <Icon type="close" top={2} />}
    </SelectItem>
  );
};

ProjectIssueCreate.propTypes = propTypes;

export default ProjectIssueCreate;
