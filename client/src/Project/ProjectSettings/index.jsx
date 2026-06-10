import React from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';

import { ProjectCategory, ProjectCategoryCopy } from 'shared/constants/projects';
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

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectSettings = ({ project, fetchProject }) => {
  const [{ isUpdating }, updateProject] = useApi.put('/project');

  return (
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
          <Breadcrumbs items={['プロジェクト', project.name, 'プロジェクト詳細']} />
          <FormHeading>プロジェクト詳細</FormHeading>

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
          <Form.Field.Select
            name="category"
            label="プロジェクトカテゴリ"
            options={categoryOptions}
          />

          <ActionButton type="submit" variant="primary" isWorking={isUpdating}>
            変更を保存
          </ActionButton>
        </FormElement>
      </FormCont>
    </Form>
  );
};

const categoryOptions = Object.values(ProjectCategory).map(category => ({
  value: category,
  label: ProjectCategoryCopy[category],
}));

ProjectSettings.propTypes = propTypes;

export default ProjectSettings;
