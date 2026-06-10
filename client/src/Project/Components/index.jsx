import React, { useState } from 'react';
import PropTypes from 'prop-types';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { Button, ConfirmModal, Modal, Form } from 'shared/components';

import {
  Page,
  Header,
  Title,
  Empty,
  List,
  Row,
  Main,
  Name,
  Description,
  CountBadge,
  RowActions,
  FormHeading,
  FormElement,
  Actions,
  ActionButton,
} from './Styles';

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectComponents = ({ project, fetchProject }) => {
  // null = modal closed, {} = create, component object = edit
  const [modalComponent, setModalComponent] = useState(null);

  const components = project.components || [];
  const issues = project.issues || [];

  const issueCount = componentId =>
    issues.filter(issue => (issue.componentIds || []).includes(componentId)).length;

  const handleDelete = async componentId => {
    try {
      await api.delete(`/components/${componentId}`);
      await fetchProject();
      toast.success('コンポーネントを削除しました。');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Page>
      <Header>
        <Title>コンポーネント</Title>
        <Button variant="primary" onClick={() => setModalComponent({})}>
          コンポーネントを作成
        </Button>
      </Header>

      {components.length === 0 ? (
        <Empty>
          コンポーネントはまだありません。「コンポーネントを作成」から追加してください。
        </Empty>
      ) : (
        <List>
          {components.map(component => (
            <Row key={component.id}>
              <Main>
                <Name>{component.name}</Name>
                {component.description && <Description>{component.description}</Description>}
              </Main>
              <CountBadge>{issueCount(component.id)} 件の課題</CountBadge>
              <RowActions>
                <Button variant="secondary" onClick={() => setModalComponent(component)}>
                  編集
                </Button>
                <ConfirmModal
                  title="このコンポーネントを削除しますか？"
                  message="削除しても課題は残り、課題からコンポーネントの紐付けが外れるだけです。"
                  confirmText="削除"
                  variant="danger"
                  onConfirm={({ close }) => handleDelete(component.id).then(close)}
                  renderLink={({ open }) => <Button variant="empty" icon="trash" onClick={open} />}
                />
              </RowActions>
            </Row>
          ))}
        </List>
      )}

      {modalComponent && (
        <Modal
          isOpen
          width={520}
          onClose={() => setModalComponent(null)}
          renderContent={modal => (
            <ComponentForm
              component={modalComponent.id ? modalComponent : null}
              onSuccess={async () => {
                await fetchProject();
                modal.close();
                setModalComponent(null);
              }}
            />
          )}
        />
      )}
    </Page>
  );
};

const componentFormPropTypes = {
  component: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

const ComponentForm = ({ component, onSuccess }) => {
  const isEdit = !!component;

  return (
    <Form
      enableReinitialize
      initialValues={Form.initialValues(component || {}, get => ({
        name: get('name', ''),
        description: get('description', ''),
      }))}
      validations={{
        name: [Form.is.required(), Form.is.maxLength(100)],
      }}
      onSubmit={async (values, form) => {
        try {
          if (isEdit) {
            await api.put(`/components/${component.id}`, values);
            toast.success('コンポーネントを更新しました。');
          } else {
            await api.post('/components', values);
            toast.success('コンポーネントを作成しました。');
          }
          onSuccess();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>{isEdit ? 'コンポーネントを編集' : 'コンポーネントを作成'}</FormHeading>
        <Form.Field.Input name="name" label="名前" tip="例: フロントエンド, API, 認証" />
        <Form.Field.Textarea name="description" label="説明" />
        <Actions>
          <ActionButton type="submit" variant="primary">
            {isEdit ? '更新' : '作成'}
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

ProjectComponents.propTypes = propTypes;
ComponentForm.propTypes = componentFormPropTypes;
ComponentForm.defaultProps = { component: null };

export default ProjectComponents;
