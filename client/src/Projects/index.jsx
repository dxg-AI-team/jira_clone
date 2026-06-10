import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { removeStoredAuthToken } from 'shared/utils/authToken';
import { setCurrentProjectId } from 'shared/utils/currentProject';
import { ProjectCategory, ProjectCategoryCopy } from 'shared/constants/projects';
import {
  Button,
  ConfirmModal,
  Modal,
  Form,
  PageLoader,
  PageError,
  ProjectAvatar,
} from 'shared/components';

import {
  Page,
  Container,
  TopBar,
  Title,
  TopActions,
  LogoutLink,
  Grid,
  ProjectCard,
  CardHeader,
  CardName,
  CardCategory,
  CardDescription,
  DeleteButton,
  Empty,
  FormHeading,
  FormElement,
  Actions,
} from './Styles';

const categoryOptions = Object.values(ProjectCategory).map(category => ({
  value: category,
  label: ProjectCategoryCopy[category],
}));

const ProjectsList = () => {
  const history = useHistory();

  // Listing projects is not project-scoped, so clear any previously selected one.
  setCurrentProjectId(null);

  const [{ data, error, isLoading }, fetchProjects] = useApi.get('/projects');
  const [{ data: currentUserData }] = useApi.get('/currentUser');
  const [isCreateOpen, setCreateOpen] = useState(false);

  const currentUser = currentUserData && currentUserData.currentUser;
  const isAdmin = !!currentUser && currentUser.role === 'admin';

  if (isLoading && !data) return <PageLoader />;
  if (error) return <PageError />;

  const projects = (data && data.projects) || [];

  const open = projectId => history.push(`/project/${projectId}/summary`);

  const handleDelete = async projectId => {
    try {
      await api.delete(`/projects/${projectId}`);
      await fetchProjects();
      toast.success('プロジェクトを削除しました。');
    } catch (err) {
      toast.error(err);
    }
  };

  const handleLogout = () => {
    removeStoredAuthToken();
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    history.push('/authenticate');
  };

  return (
    <Page>
      <Container>
        <TopBar>
          <Title>プロジェクト</Title>
          <TopActions>
            {isAdmin && (
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                プロジェクトを作成
              </Button>
            )}
            <LogoutLink onClick={handleLogout}>ログアウト</LogoutLink>
          </TopActions>
        </TopBar>

        {projects.length === 0 ? (
          <Empty>
            参加しているプロジェクトがありません。
            {isAdmin && '「プロジェクトを作成」から追加してください。'}
          </Empty>
        ) : (
          <Grid>
            {projects.map(project => (
              <ProjectCard key={project.id} onClick={() => open(project.id)}>
                {isAdmin && (
                  <DeleteButton onClick={e => e.stopPropagation()}>
                    <ConfirmModal
                      title={`「${project.name}」を削除しますか？`}
                      message="プロジェクトとそのすべての課題・データが削除されます。元に戻せません。"
                      confirmText="削除"
                      variant="danger"
                      onConfirm={({ close }) => handleDelete(project.id).then(close)}
                      renderLink={({ open: openConfirm }) => (
                        <Button variant="empty" icon="trash" onClick={openConfirm} />
                      )}
                    />
                  </DeleteButton>
                )}
                <CardHeader>
                  <ProjectAvatar
                    name={project.name}
                    icon={project.icon}
                    avatarUrl={project.avatarUrl}
                    size={36}
                  />
                  <div style={{ marginLeft: 12, minWidth: 0 }}>
                    <CardName>{project.name}</CardName>
                    <CardCategory>{ProjectCategoryCopy[project.category]}プロジェクト</CardCategory>
                  </div>
                </CardHeader>
                <CardDescription>{project.description}</CardDescription>
              </ProjectCard>
            ))}
          </Grid>
        )}

        {isCreateOpen && (
          <Modal
            isOpen
            width={540}
            onClose={() => setCreateOpen(false)}
            renderContent={modal => (
              <ProjectForm
                onSuccess={async () => {
                  await fetchProjects();
                  modal.close();
                  setCreateOpen(false);
                }}
              />
            )}
          />
        )}
      </Container>
    </Page>
  );
};

const ProjectForm = ({ onSuccess }) => (
  <Form
    initialValues={{ name: '', url: '', description: '', category: ProjectCategory.SOFTWARE }}
    validations={{
      name: [Form.is.required(), Form.is.maxLength(100)],
      category: Form.is.required(),
    }}
    onSubmit={async (values, form) => {
      try {
        await api.post('/projects', values);
        toast.success('プロジェクトを作成しました。');
        onSuccess();
      } catch (error) {
        Form.handleAPIError(error, form);
      }
    }}
  >
    <FormElement>
      <FormHeading>プロジェクトを作成</FormHeading>
      <Form.Field.Input name="name" label="名前" />
      <Form.Field.Select name="category" label="カテゴリ" options={categoryOptions} />
      <Form.Field.Textarea name="description" label="説明" />
      <Actions>
        <Button type="submit" variant="primary">
          作成
        </Button>
      </Actions>
    </FormElement>
  </Form>
);

ProjectForm.propTypes = { onSuccess: PropTypes.func.isRequired };

export default ProjectsList;
