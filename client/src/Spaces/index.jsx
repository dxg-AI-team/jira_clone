import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useFormikContext } from 'formik';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { removeStoredAuthToken } from 'shared/utils/authToken';
import { setCurrentProjectId } from 'shared/utils/currentProject';
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
  LinkText,
  Grid,
  Card,
  CardMeta,
  CardName,
  CardSub,
  DeleteButton,
  Empty,
  FormHeading,
  FormElement,
  Actions,
  IconChoices,
  IconChoice,
} from './Styles';

const iconOptions = ['🏢', '🚀', '🐞', '💼', '🎨', '⚙️', '📊', '🔧', '🌟', '📁', '💡', '🧩'];

const IconPicker = () => {
  const { values, setFieldValue } = useFormikContext();
  return (
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
  );
};

const SpacesList = () => {
  const history = useHistory();
  setCurrentProjectId(null);

  const [{ data, error, isLoading }, fetchSpaces] = useApi.get('/spaces');
  const [{ data: currentUserData }] = useApi.get('/currentUser');
  const [isCreateOpen, setCreateOpen] = useState(false);

  const currentUser = currentUserData && currentUserData.currentUser;
  const isGlobalAdmin = !!currentUser && currentUser.role === 'admin';
  // Space creation is limited to global admins and granted users.
  const canCreateSpace = isGlobalAdmin || (!!currentUser && currentUser.canCreateSpace);
  // Anyone can delete a space they administer (global admin or that space's admin).
  const canManage = space =>
    isGlobalAdmin || (!!currentUser && (space.adminIds || []).includes(currentUser.id));

  if (isLoading && !data) return <PageLoader />;
  if (error) return <PageError />;

  const spaces = (data && data.spaces) || [];

  const handleDelete = async spaceId => {
    try {
      await api.delete(`/spaces/${spaceId}`);
      await fetchSpaces();
      toast.success('スペースを削除しました。');
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
          <Title>スペース</Title>
          <TopActions>
            {canCreateSpace && (
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                スペースを作成
              </Button>
            )}
            {isGlobalAdmin && (
              <LinkText onClick={() => history.push('/admin/users')}>ユーザー管理</LinkText>
            )}
            <LinkText onClick={handleLogout}>ログアウト</LinkText>
          </TopActions>
        </TopBar>

        {spaces.length === 0 ? (
          <Empty>
            参加しているスペースがありません。
            {canCreateSpace && '「スペースを作成」から追加してください。'}
          </Empty>
        ) : (
          <Grid>
            {spaces.map(space => (
              <Card key={space.id} onClick={() => history.push(`/space/${space.id}`)}>
                {canManage(space) && (
                  <DeleteButton onClick={e => e.stopPropagation()}>
                    <ConfirmModal
                      title={`「${space.name}」を削除しますか？`}
                      message="スペースと、その中のすべてのボード・課題・データが削除されます。元に戻せません。"
                      confirmText="削除"
                      variant="danger"
                      onConfirm={({ close }) => handleDelete(space.id).then(close)}
                      renderLink={({ open }) => (
                        <Button variant="empty" icon="trash" onClick={open} />
                      )}
                    />
                  </DeleteButton>
                )}
                <ProjectAvatar name={space.name} icon={space.icon} avatarUrl={space.avatarUrl} />
                <CardMeta>
                  <CardName>{space.name}</CardName>
                  <CardSub>スペース</CardSub>
                </CardMeta>
              </Card>
            ))}
          </Grid>
        )}

        {isCreateOpen && (
          <Modal
            isOpen
            width={520}
            onClose={() => setCreateOpen(false)}
            renderContent={modal => (
              <SpaceForm
                onSuccess={async () => {
                  await fetchSpaces();
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

const SpaceForm = ({ onSuccess }) => (
  <Form
    initialValues={{ name: '', icon: '🏢' }}
    validations={{ name: [Form.is.required(), Form.is.maxLength(100)] }}
    onSubmit={async (values, form) => {
      try {
        await api.post('/spaces', values);
        toast.success('スペースを作成しました。');
        onSuccess();
      } catch (error) {
        Form.handleAPIError(error, form);
      }
    }}
  >
    <FormElement>
      <FormHeading>スペースを作成</FormHeading>
      <Form.Field.Input name="name" label="名前" />
      <IconPicker />
      <Actions>
        <Button type="submit" variant="primary">
          作成
        </Button>
      </Actions>
    </FormElement>
  </Form>
);

SpaceForm.propTypes = { onSuccess: PropTypes.func.isRequired };

export default SpacesList;
