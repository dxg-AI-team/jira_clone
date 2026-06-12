import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';

import { ProjectCategory, ProjectCategoryCopy } from 'shared/constants/projects';
import { IssueStatus, IssueStatusCopy } from 'shared/constants/issues';
import { parseWorkflow } from 'shared/utils/workflow';
import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { Form, Breadcrumbs } from 'shared/components';

import {
  FormCont,
  FormHeading,
  FormElement,
  ActionButton,
  IconFieldLabel,
  IconChoices,
  IconChoice,
  WorkflowCont,
  WorkflowInner,
  WorkflowHint,
  WorkflowRow,
  WorkflowStatus,
  WorkflowInput,
  WipInput,
} from './Styles';

const iconOptions = ['📋', '🚀', '🐞', '💼', '🎨', '⚙️', '📊', '🔧', '🌟', '📁', '💡', '🧩'];

const IconPicker = () => {
  const { values, setFieldValue } = useFormikContext();
  return (
    <div>
      <IconFieldLabel>アイコン</IconFieldLabel>
      <IconChoices>
        {iconOptions.map(icon => (
          <IconChoice
            key={icon}
            isSelected={values.icon === icon}
            onClick={() => setFieldValue('icon', values.icon === icon ? null : icon)}
          >
            {icon}
          </IconChoice>
        ))}
      </IconChoices>
    </div>
  );
};

const workflowPropTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const WorkflowSettings = ({ project, fetchProject }) => {
  const existing = parseWorkflow(project);
  const [rows, setRows] = useState(
    Object.values(IssueStatus).map(status => ({
      status,
      name: (existing[status] && existing[status].name) || '',
      wipLimit:
        existing[status] && existing[status].wipLimit ? String(existing[status].wipLimit) : '',
    })),
  );
  const [isWorking, setWorking] = useState(false);

  const updateRow = (status, field, value) =>
    setRows(prev => prev.map(row => (row.status === status ? { ...row, [field]: value } : row)));

  const save = async () => {
    setWorking(true);
    try {
      const config = rows
        .map(row => ({
          status: row.status,
          name: row.name.trim() || undefined,
          wipLimit: row.wipLimit ? Number(row.wipLimit) : undefined,
        }))
        .filter(row => row.name || row.wipLimit);
      await api.put('/project', { workflow: config.length ? JSON.stringify(config) : null });
      await fetchProject();
      toast.success('ワークフローを保存しました。');
    } catch (error) {
      toast.error(error);
    }
    setWorking(false);
  };

  return (
    <WorkflowCont>
      <WorkflowInner>
        <FormHeading>ワークフロー</FormHeading>
        <WorkflowHint>
          カンバンボードの各列の表示名と
          WIP（仕掛り）上限をカスタマイズできます。空欄なら既定の名称・上限なしになります。
        </WorkflowHint>
        {rows.map(row => (
          <WorkflowRow key={row.status}>
            <WorkflowStatus>{IssueStatusCopy[row.status]}</WorkflowStatus>
            <WorkflowInput
              placeholder={IssueStatusCopy[row.status]}
              value={row.name}
              onChange={event => updateRow(row.status, 'name', event.target.value)}
            />
            <WipInput
              type="number"
              min="0"
              placeholder="WIP上限"
              value={row.wipLimit}
              onChange={event => updateRow(row.status, 'wipLimit', event.target.value)}
            />
          </WorkflowRow>
        ))}
        <ActionButton variant="primary" isWorking={isWorking} onClick={save}>
          ワークフローを保存
        </ActionButton>
      </WorkflowInner>
    </WorkflowCont>
  );
};

WorkflowSettings.propTypes = workflowPropTypes;

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectSettings = ({ project, fetchProject }) => {
  const [{ isUpdating }, updateProject] = useApi.put('/project');

  return (
    <React.Fragment>
      <Form
        initialValues={Form.initialValues(project, get => ({
          name: get('name'),
          icon: get('icon', null),
          avatarUrl: get('avatarUrl', ''),
          url: get('url'),
          category: get('category'),
          description: get('description'),
        }))}
        validations={{
          name: [Form.is.required(), Form.is.maxLength(100)],
          url: Form.is.url(),
          category: Form.is.required(),
        }}
        onSubmit={async (values, form) => {
          try {
            await updateProject(values);
            await fetchProject();
            toast.success('変更を保存しました。');
          } catch (error) {
            Form.handleAPIError(error, form);
          }
        }}
      >
        <FormCont>
          <FormElement>
            <Breadcrumbs
              items={[project.space ? project.space.name : 'スペース', project.name, 'ボード設定']}
            />
            <FormHeading>ボード設定</FormHeading>

            <Form.Field.Input name="name" label="名前" />
            <IconPicker />
            <Form.Field.Input
              name="avatarUrl"
              label="アイコン画像URL"
              tip="画像URLを指定するとアイコンより優先して表示されます。"
            />
            <Form.Field.Input name="url" label="URL" />
            <Form.Field.TextEditor
              name="description"
              label="説明"
              tip="プロジェクトをできるだけ詳しく記述してください。"
            />
            <Form.Field.Select name="category" label="ボードのカテゴリ" options={categoryOptions} />

            <ActionButton type="submit" variant="primary" isWorking={isUpdating}>
              変更を保存
            </ActionButton>
          </FormElement>
        </FormCont>
      </Form>
      <WorkflowSettings project={project} fetchProject={fetchProject} />
    </React.Fragment>
  );
};

const categoryOptions = Object.values(ProjectCategory).map(category => ({
  value: category,
  label: ProjectCategoryCopy[category],
}));

ProjectSettings.propTypes = propTypes;

export default ProjectSettings;
