import React from 'react';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { Button, Avatar, PageLoader, PageError } from 'shared/components';

import {
  Page,
  Container,
  TopBar,
  Title,
  BackLink,
  Hint,
  UserList,
  UserRow,
  UserMeta,
  UserName,
  UserEmail,
  RoleBadge,
  PermCell,
} from './Styles';

const UsersAdmin = () => {
  const history = useHistory();

  const [{ data, error, isLoading }, fetchUsers] = useApi.get('/users/all');
  const [{ data: currentUserData }] = useApi.get('/currentUser');

  const currentUser = currentUserData && currentUserData.currentUser;

  if (isLoading && !data) return <PageLoader />;
  if (error) return <PageError />;

  // Global-admin only page.
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <Page>
        <Container>
          <BackLink onClick={() => history.push('/spaces')}>← スペース一覧へ</BackLink>
          <Title>ユーザー管理</Title>
          <Hint>このページは全体管理者のみが利用できます。</Hint>
        </Container>
      </Page>
    );
  }

  const users = (data && data.users) || [];

  const setCanCreateSpace = async (userId, canCreateSpace) => {
    try {
      await api.put(`/users/${userId}`, { canCreateSpace });
      await fetchUsers();
      toast.success('権限を更新しました。');
    } catch (err) {
      toast.error(err);
    }
  };

  const renderPermission = user => {
    if (user.role === 'admin') return <span>スペース作成可（管理者）</span>;
    if (user.canCreateSpace) {
      return (
        <Button variant="primary" onClick={() => setCanCreateSpace(user.id, false)}>
          スペース作成: 許可中
        </Button>
      );
    }
    return (
      <Button variant="secondary" onClick={() => setCanCreateSpace(user.id, true)}>
        スペース作成を許可
      </Button>
    );
  };

  return (
    <Page>
      <Container>
        <BackLink onClick={() => history.push('/spaces')}>← スペース一覧へ</BackLink>
        <TopBar>
          <Title>ユーザー管理</Title>
        </TopBar>
        <Hint>
          「スペース作成」を許可したユーザーだけが新しいスペースを作成できます。全体管理者は常に作成できます。
        </Hint>

        <UserList>
          {users.map(user => {
            const isAdmin = user.role === 'admin';
            return (
              <UserRow key={user.id}>
                <Avatar size={32} avatarUrl={user.avatarUrl} name={user.name} />
                <UserMeta>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserMeta>
                <RoleBadge admin={isAdmin}>{isAdmin ? '全体管理者' : 'メンバー'}</RoleBadge>
                <PermCell>{renderPermission(user)}</PermCell>
              </UserRow>
            );
          })}
        </UserList>
      </Container>
    </Page>
  );
};

export default UsersAdmin;
