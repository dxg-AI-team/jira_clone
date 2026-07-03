import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';

import { ProjectCategory, ProjectCategoryCopy } from 'shared/constants/projects';
import { getColumns } from 'shared/utils/workflow';
import { normalizeKey, isValidKey } from 'shared/utils/projectKey';
import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { Form, Breadcrumbs, Button, Icon } from 'shared/components';

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
  WorkflowPosition,
  WorkflowInput,
  WipInput,
  RowActions,
  AddColumnButton,
} from './Styles';

let columnSeq = 0;
const newColumnKey = () => {
  columnSeq += 1;
  return `col-${Date.now().toString(36)}-${columnSeq}`;
};

const iconOptions = ['📋', '🚀', '🐞', '💼', '🎨', '⚙️', '📊', '🔧', '🌟', '📁', '💡', '🧩'];

// Live-normalize the key field (uppercase + strip invalid characters).
const KeyNormalizeEffect = () => {
  const { values, setFieldValue } = useFormikContext();
  useEffect(() => {
    const normalized = normalizeKey(values.key);
    if (normalized !== values.key) setFieldValue('key', normalized);
  }, [values.key, setFieldValue]);
  return null;
};

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
  const [rows, setRows] = useState(
    getColumns(project).map(c => ({
      key: c.key,
      name: c.name,
      wipLimit: c.wipLimit ? String(c.wipLimit) : '',
    })),
  );
  const [isWorking, setWorking] = useState(false);

  const updateRow = (key, field, value) =>
    setRows(prev => prev.map(row => (row.key === key ? { ...row, [field]: value } : row)));

  const move = (index, delta) =>
    setRows(prev => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeRow = key => setRows(prev => prev.filter(row => row.key !== key));

  const addRow = () => setRows(prev => [...prev, { key: newColumnKey(), name: '', wipLimit: '' }]);

  const save = async () => {
    const cleaned = rows.map(row => ({ ...row, name: row.name.trim() }));
    if (cleaned.length < 2) {
      toast.error('列は最低2つ必要です。');
      return;
    }
    if (cleaned.some(row => !row.name)) {
      toast.error('すべての列に名前を入力してください。');
      return;
    }
    setWorking(true);
    try {
      const config = cleaned.map(row => ({
        key: row.key,
        name: row.name,
        wipLimit: row.wipLimit ? Number(row.wipLimit) : undefined,
      }));
      await api.put('/project', { workflow: JSON.stringify(config) });
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
        <FormHeading>ワークフロー（カンバンの列）</FormHeading>
        <WorkflowHint>
          カンバンボードの列を追加・削除・並べ替え・改名できます（2列以上）。
          <b>先頭が「未着手」、末尾が「完了」</b>
          として扱われ、スプリント完了やレポートの集計に使われます。WIP（仕掛り）上限は任意です。
          列を削除すると、その列にあった課題は先頭の列に移動します。
        </WorkflowHint>
        {rows.map((row, index) => (
          <WorkflowRow key={row.key}>
            <WorkflowPosition>{index + 1}</WorkflowPosition>
            <WorkflowInput
              placeholder="列名"
              value={row.name}
              onChange={event => updateRow(row.key, 'name', event.target.value)}
            />
            <WipInput
              type="number"
              min="0"
              placeholder="WIP上限"
              value={row.wipLimit}
              onChange={event => updateRow(row.key, 'wipLimit', event.target.value)}
            />
            <RowActions>
              <Button
                variant="empty"
                icon="arrow-up"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              />
              <Button
                variant="empty"
                icon="arrow-down"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
              />
              <Button
                variant="empty"
                icon="trash"
                onClick={() => removeRow(row.key)}
                disabled={rows.length <= 2}
              />
            </RowActions>
          </WorkflowRow>
        ))}
        <AddColumnButton onClick={addRow}>
          <Icon type="plus" size={18} />
          列を追加
        </AddColumnButton>
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
          key: get('key', ''),
          icon: get('icon', null),
          avatarUrl: get('avatarUrl', ''),
          url: get('url'),
          category: get('category'),
          description: get('description'),
        }))}
        validations={{
          name: [Form.is.required(), Form.is.maxLength(50)],
          key: [
            Form.is.required(),
            Form.is.match(
              isValidKey,
              '英大文字で始まる2〜10文字の英数字で入力してください（例: ABC）',
            ),
          ],
          url: Form.is.url(),
          category: Form.is.required(),
        }}
        onSubmit={async (values, form) => {
          try {
            await updateProject({ ...values, key: normalizeKey(values.key) });
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

            <KeyNormalizeEffect />
            <Form.Field.Input name="name" label="名前" />
            <Form.Field.Input
              name="key"
              label="プロジェクトキー"
              tip="課題キーの接頭辞になります（例: ABC → ABC-1）。変更すると既存課題のキー表示もすべて更新されます。"
            />
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
