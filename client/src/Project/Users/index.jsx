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
  const [{ data: allUsersData }, fetchAllUsers] = useApi.get('/users/all');

  const currentUser = currentUserData && currentUserData.currentUser;
  const isAdmin = !!currentUser && currentUser.role === 'admin';

  const [editingUser, setEditingUser] = useState(null);
  const [isAddOpen, setAddOpen] = useState(false);

  const members = project.users || [];
  const allUsers = (allUsersData && allUsersData.users) || [];
  const nonMembers = allUsers.filter(u => !members.some(m => m.id === u.id));

  const refresh = async () => {
    await fetchProject();
    await fetchAllUsers();
  };

  const handleRemoveMember = async userId => {
    try {
      await api.delete(`/project/members/${userId}`);
      await fetchProject();
      toast.success('メンバーを外しました。');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Page>
      <Header>
        <Title>メンバー</Title>
        {isAdmin && (
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            メンバーを追加
          </Button>
        )}
      </Header>

      <UserList>
        {members.map(user => {
          const isSelf = currentUser && currentUser.id === user.id;
          const canEdit = isAdmin || isSelf;
          const canRemove = isAdmin && !isSelf;

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
                  <Button variant="secondary" onClick={() => setEditingUser(user)}>
                    編集
                  </Button>
                )}
                {canRemove && (
                  <ConfirmModal
                    title="このメンバーをプロジェクトから外しますか？"
                    message="ユーザー自体は削除されません。再度追加できます。"
                    confirmText="外す"
                    variant="danger"
                    onConfirm={({ close }) => handleRemoveMember(user.id).then(close)}
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

      {isAddOpen && (
        <Modal
          isOpen
          width={520}
          onClose={() => setAddOpen(false)}
          renderContent={modal => (
            <AddMemberForm
              nonMembers={nonMembers}
              onSuccess={async () => {
                await refresh();
                modal.close();
                setAddOpen(false);
              }}
            />
          )}
        />
      )}

      {editingUser && (
        <Modal
          isOpen
          width={520}
          onClose={() => setEditingUser(null)}
          renderContent={modal => (
            <EditUserForm
              user={editingUser}
              isAdmin={isAdmin}
              onSuccess={async () => {
                await refresh();
                modal.close();
                setEditingUser(null);
              }}
            />
          )}
        />
      )}
    </Page>
  );
};

const AddMemberForm = ({ nonMembers, onSuccess }) => {
  const [mode, setMode] = useState('existing');
  const userOptions = nonMembers.map(u => ({ value: u.id, label: `${u.name}（${u.email}）` }));

  return (
    <Form
      enableReinitialize
      initialValues={{ userId: null, name: '', email: '', role: 'member' }}
      validations={
        mode === 'existing'
          ? { userId: Form.is.required() }
          : {
              name: [Form.is.required(), Form.is.maxLength(100)],
              email: [Form.is.required(), Form.is.email()],
            }
      }
      onSubmit={async (values, form) => {
        try {
          if (mode === 'existing') {
            await api.post('/project/members', { userId: values.userId });
          } else {
            await api.post('/users', {
              name: values.name,
              email: values.email,
              role: values.role,
            });
          }
          toast.success('メンバーを追加しました。');
          onSuccess();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>メンバーを追加</FormHeading>
        <Actions style={{ paddingTop: 0, marginBottom: 16 }}>
          <ActionButton
            type="button"
            variant={mode === 'existing' ? 'primary' : 'secondary'}
            onClick={() => setMode('existing')}
          >
            既存ユーザー
          </ActionButton>
          <ActionButton
            type="button"
            variant={mode === 'new' ? 'primary' : 'secondary'}
            onClick={() => setMode('new')}
          >
            新規作成
          </ActionButton>
        </Actions>

        {mode === 'existing' ? (
          <Form.Field.Select
            name="userId"
            label="ユーザー"
            options={userOptions}
            tip={userOptions.length === 0 ? '追加できる既存ユーザーがいません。' : undefined}
          />
        ) : (
          <React.Fragment>
            <Form.Field.Input name="name" label="名前" />
            <Form.Field.Input name="email" label="メールアドレス" />
            <Form.Field.Select name="role" label="ロール" options={roleOptions} />
          </React.Fragment>
        )}

        <Actions>
          <ActionButton type="submit" variant="primary">
            追加
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

const EditUserForm = ({ user, isAdmin, onSuccess }) => (
  <Form
    enableReinitialize
    initialValues={Form.initialValues(user, get => ({
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
        await api.put(`/users/${user.id}`, values);
        toast.success('ユーザー情報を更新しました。');
        onSuccess();
      } catch (error) {
        Form.handleAPIError(error, form);
      }
    }}
  >
    <FormElement>
      <FormHeading>ユーザーを編集</FormHeading>
      <Form.Field.Input name="name" label="名前" />
      <Form.Field.Input name="email" label="メールアドレス" disabled={!isAdmin} />
      <Form.Field.Input name="avatarUrl" label="アバター画像URL" />
      {isAdmin && <Form.Field.Select name="role" label="ロール" options={roleOptions} />}
      <Actions>
        <ActionButton type="submit" variant="primary">
          更新
        </ActionButton>
      </Actions>
    </FormElement>
  </Form>
);

AddMemberForm.propTypes = {
  nonMembers: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

EditUserForm.propTypes = {
  user: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

ProjectUsers.propTypes = propTypes;

export default ProjectUsers;
