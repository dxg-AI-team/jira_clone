import React, { useState } from 'react';
import PropTypes from 'prop-types';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { Avatar, Button, ConfirmModal, Modal, Form } from 'shared/components';

import {
  Page,
  Header,
  Title,
  UserList,
  UserRow,
  UserInfo,
  UserMeta,
  UserName,
  UserEmail,
  RoleBadge,
  RowActions,
  FormHeading,
  FormElement,
  Actions,
  ActionButton,
} from './Styles';

const roleOptions = [
  { value: 'admin', label: '管理者' },
  { value: 'member', label: 'メンバー' },
];

const roleLabel = role => (role === 'admin' ? '管理者' : 'メンバー');

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectUsers = ({ project, fetchProject }) => {
  const [{ data: currentUserData }] = useApi.get('/currentUser');
  const currentUser = currentUserData && currentUserData.currentUser;
  const isAdmin = !!currentUser && currentUser.role === 'admin';

  // null = modal closed, {} = add new, user object = edit existing
  const [modalUser, setModalUser] = useState(null);

  const users = project.users || [];

  const handleDelete = async userId => {
    try {
      await api.delete(`/users/${userId}`);
      await fetchProject();
      toast.success('ユーザーを削除しました。');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Page>
      <Header>
        <Title>ユーザー</Title>
        {isAdmin && (
          <Button variant="primary" onClick={() => setModalUser({})}>
            メンバーを追加
          </Button>
        )}
      </Header>

      <UserList>
        {users.map(user => {
          const isSelf = currentUser && currentUser.id === user.id;
          const canEdit = isAdmin || isSelf;
          const canDelete = isAdmin && !isSelf;

          return (
            <UserRow key={user.id}>
              <UserInfo>
                <Avatar size={36} avatarUrl={user.avatarUrl} name={user.name} />
                <UserMeta>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserMeta>
              </UserInfo>

              <RoleBadge isAdmin={user.role === 'admin'}>{roleLabel(user.role)}</RoleBadge>

              <RowActions>
                {canEdit && (
                  <Button variant="secondary" onClick={() => setModalUser(user)}>
                    編集
                  </Button>
                )}
                {canDelete && (
                  <ConfirmModal
                    title="このユーザーを削除しますか？"
                    message="削除すると元に戻せません。担当中の課題やコメントも削除されます。"
                    confirmText="削除"
                    variant="danger"
                    onConfirm={({ close }) => handleDelete(user.id).then(close)}
                    renderLink={({ open }) => (
                      <Button variant="empty" icon="trash" onClick={open} />
                    )}
                  />
                )}
              </RowActions>
            </UserRow>
          );
        })}
      </UserList>

      {modalUser && (
        <Modal
          isOpen
          width={520}
          onClose={() => setModalUser(null)}
          renderContent={modal => (
            <UserForm
              user={modalUser.id ? modalUser : null}
              isAdmin={isAdmin}
              onSuccess={async () => {
                await fetchProject();
                modal.close();
                setModalUser(null);
              }}
            />
          )}
        />
      )}
    </Page>
  );
};

const userFormPropTypes = {
  user: PropTypes.object,
  isAdmin: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

const UserForm = ({ user, isAdmin, onSuccess }) => {
  const isEdit = !!user;

  return (
    <Form
      enableReinitialize
      initialValues={Form.initialValues(user || {}, get => ({
        name: get('name', ''),
        email: get('email', ''),
        avatarUrl: get('avatarUrl', ''),
        role: get('role', 'member'),
      }))}
      validations={{
        name: [Form.is.required(), Form.is.maxLength(100)],
        email: [Form.is.required(), Form.is.email()],
      }}
      onSubmit={async (values, form) => {
        try {
          if (isEdit) {
            await api.put(`/users/${user.id}`, values);
            toast.success('ユーザー情報を更新しました。');
          } else {
            await api.post('/users', values);
            toast.success('ユーザーを追加しました。');
          }
          onSuccess();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>{isEdit ? 'ユーザーを編集' : 'メンバーを追加'}</FormHeading>
        <Form.Field.Input name="name" label="名前" />
        <Form.Field.Input name="email" label="メールアドレス" disabled={!isAdmin} />
        <Form.Field.Input name="avatarUrl" label="アバター画像URL" />
        {isAdmin && <Form.Field.Select name="role" label="ロール" options={roleOptions} />}
        <Actions>
          <ActionButton type="submit" variant="primary">
            {isEdit ? '更新' : '追加'}
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

ProjectUsers.propTypes = propTypes;
UserForm.propTypes = userFormPropTypes;
UserForm.defaultProps = { user: null };

export default ProjectUsers;
