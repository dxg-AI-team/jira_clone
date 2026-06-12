import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { ProjectCategory, ProjectCategoryCopy } from 'shared/constants/projects';
import {
  Button,
  ConfirmModal,
  Modal,
  Form,
  Avatar,
  PageLoader,
  PageError,
  ProjectAvatar,
} from 'shared/components';

import {
  Page,
  Container,
  Breadcrumb,
  Header,
  HeaderMeta,
  SpaceName,
  SectionHead,
  SectionTitle,
  Grid,
  Card,
  CardMeta,
  CardName,
  CardSub,
  DeleteButton,
  Empty,
  MemberList,
  MemberRow,
  MemberMeta,
  MemberName,
  MemberEmail,
  FormHeading,
  FormElement,
  Actions,
} from './Styles';

const categoryOptions = Object.values(ProjectCategory).map(category => ({
  value: category,
  label: ProjectCategoryCopy[category],
}));

const SpaceBoards = () => {
  const history = useHistory();
  const { spaceId } = useParams();

  const [{ data, error, isLoading }, fetchSpace] = useApi.get(`/spaces/${spaceId}`, { spaceId });
  const [{ data: currentUserData }] = useApi.get('/currentUser');
  const [{ data: allUsersData }, fetchAllUsers] = useApi.get('/users/all');

  const [isBoardOpen, setBoardOpen] = useState(false);
  const [isMemberOpen, setMemberOpen] = useState(false);

  if (isLoading && !data) return <PageLoader />;
  if (error) return <PageError />;

  const space = data && data.space;
  if (!space) return <PageLoader />;

  const currentUser = currentUserData && currentUserData.currentUser;
  const isAdmin = !!currentUser && currentUser.role === 'admin';
  const boards = space.boards || [];
  const members = space.users || [];
  const allUsers = (allUsersData && allUsersData.users) || [];
  const nonMembers = allUsers.filter(u => !members.some(m => m.id === u.id));

  const refresh = async () => {
    await fetchSpace();
    await fetchAllUsers();
  };

  const deleteBoard = async boardId => {
    try {
      await api.delete(`/projects/${boardId}`);
      await fetchSpace();
      toast.success('ボードを削除しました。');
    } catch (err) {
      toast.error(err);
    }
  };

  const removeMember = async userId => {
    try {
      await api.delete(`/spaces/${spaceId}/members/${userId}`);
      await fetchSpace();
      toast.success('メンバーを外しました。');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Page>
      <Container>
        <Breadcrumb>
          <Button variant="empty" onClick={() => history.push('/spaces')}>
            スペース
          </Button>
          {` / ${space.name}`}
        </Breadcrumb>

        <Header>
          <ProjectAvatar
            name={space.name}
            icon={space.icon}
            avatarUrl={space.avatarUrl}
            size={48}
          />
          <HeaderMeta>
            <SpaceName>{space.name}</SpaceName>
          </HeaderMeta>
        </Header>

        <SectionHead>
          <SectionTitle>ボード</SectionTitle>
          {isAdmin && (
            <Button variant="primary" onClick={() => setBoardOpen(true)}>
              ボードを作成
            </Button>
          )}
        </SectionHead>

        {boards.length === 0 ? (
          <Empty>ボードがありません。{isAdmin && '「ボードを作成」から追加してください。'}</Empty>
        ) : (
          <Grid>
            {boards.map(board => (
              <Card key={board.id} onClick={() => history.push(`/project/${board.id}/summary`)}>
                {isAdmin && (
                  <DeleteButton onClick={e => e.stopPropagation()}>
                    <ConfirmModal
                      title={`「${board.name}」を削除しますか？`}
                      message="ボードとその課題・データが削除されます。元に戻せません。"
                      confirmText="削除"
                      variant="danger"
                      onConfirm={({ close }) => deleteBoard(board.id).then(close)}
                      renderLink={({ open }) => (
                        <Button variant="empty" icon="trash" onClick={open} />
                      )}
                    />
                  </DeleteButton>
                )}
                <ProjectAvatar name={board.name} icon={board.icon} avatarUrl={board.avatarUrl} />
                <CardMeta>
                  <CardName>{board.name}</CardName>
                  <CardSub>{ProjectCategoryCopy[board.category]}ボード</CardSub>
                </CardMeta>
              </Card>
            ))}
          </Grid>
        )}

        <SectionHead>
          <SectionTitle>メンバー</SectionTitle>
          {isAdmin && (
            <Button variant="secondary" onClick={() => setMemberOpen(true)}>
              メンバーを追加
            </Button>
          )}
        </SectionHead>

        <MemberList>
          {members.map(member => (
            <MemberRow key={member.id}>
              <Avatar size={32} avatarUrl={member.avatarUrl} name={member.name} />
              <MemberMeta>
                <MemberName>{member.name}</MemberName>
                <MemberEmail>{member.email}</MemberEmail>
              </MemberMeta>
              {isAdmin && currentUser.id !== member.id && (
                <ConfirmModal
                  title="このメンバーをスペースから外しますか？"
                  message="ユーザー自体は削除されません。"
                  confirmText="外す"
                  variant="danger"
                  onConfirm={({ close }) => removeMember(member.id).then(close)}
                  renderLink={({ open }) => <Button variant="empty" icon="trash" onClick={open} />}
                />
              )}
            </MemberRow>
          ))}
        </MemberList>

        {isBoardOpen && (
          <Modal
            isOpen
            width={520}
            onClose={() => setBoardOpen(false)}
            renderContent={modal => (
              <BoardForm
                spaceId={spaceId}
                onSuccess={async () => {
                  await fetchSpace();
                  modal.close();
                  setBoardOpen(false);
                }}
              />
            )}
          />
        )}

        {isMemberOpen && (
          <Modal
            isOpen
            width={520}
            onClose={() => setMemberOpen(false)}
            renderContent={modal => (
              <MemberForm
                spaceId={spaceId}
                nonMembers={nonMembers}
                onSuccess={async () => {
                  await refresh();
                  modal.close();
                  setMemberOpen(false);
                }}
              />
            )}
          />
        )}
      </Container>
    </Page>
  );
};

const BoardForm = ({ spaceId, onSuccess }) => (
  <Form
    initialValues={{ name: '', category: ProjectCategory.SOFTWARE, icon: '📋' }}
    validations={{
      name: [Form.is.required(), Form.is.maxLength(100)],
      category: Form.is.required(),
    }}
    onSubmit={async (values, form) => {
      try {
        await api.post('/projects', { ...values, spaceId: Number(spaceId) });
        toast.success('ボードを作成しました。');
        onSuccess();
      } catch (error) {
        Form.handleAPIError(error, form);
      }
    }}
  >
    <FormElement>
      <FormHeading>ボードを作成</FormHeading>
      <Form.Field.Input name="name" label="名前" />
      <Form.Field.Select name="category" label="カテゴリ" options={categoryOptions} />
      <Actions>
        <Button type="submit" variant="primary">
          作成
        </Button>
      </Actions>
    </FormElement>
  </Form>
);

const MemberForm = ({ spaceId, nonMembers, onSuccess }) => {
  const userOptions = nonMembers.map(u => ({ value: u.id, label: `${u.name}（${u.email}）` }));
  return (
    <Form
      initialValues={{ userId: null }}
      validations={{ userId: Form.is.required() }}
      onSubmit={async (values, form) => {
        try {
          await api.post(`/spaces/${spaceId}/members`, { userId: values.userId });
          toast.success('メンバーを追加しました。');
          onSuccess();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>メンバーを追加</FormHeading>
        <Form.Field.Select
          name="userId"
          label="ユーザー"
          options={userOptions}
          tip={userOptions.length === 0 ? '追加できる既存ユーザーがいません。' : undefined}
        />
        <Actions>
          <Button type="submit" variant="primary">
            追加
          </Button>
        </Actions>
      </FormElement>
    </Form>
  );
};

BoardForm.propTypes = {
  spaceId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
MemberForm.propTypes = {
  spaceId: PropTypes.string.isRequired,
  nonMembers: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default SpaceBoards;
