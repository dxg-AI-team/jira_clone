import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { useFormikContext } from 'formik';

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
  RoleBadge,
  MemberActions,
  FormHeading,
  FormElement,
  Actions,
  IconChoices,
  IconChoice,
} from './Styles';

const categoryOptions = Object.values(ProjectCategory).map(category => ({
  value: category,
  label: ProjectCategoryCopy[category],
}));

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

const SpaceBoards = () => {
  const history = useHistory();
  const { spaceId } = useParams();

  const [{ data, error, isLoading }, fetchSpace] = useApi.get(`/spaces/${spaceId}`, { spaceId });
  const [{ data: currentUserData }] = useApi.get('/currentUser');

  const [isBoardOpen, setBoardOpen] = useState(false);
  const [isMemberOpen, setMemberOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);

  if (isLoading && !data) return <PageLoader />;
  if (error) return <PageError />;

  const space = data && data.space;
  if (!space) return <PageLoader />;

  const currentUser = currentUserData && currentUserData.currentUser;
  const adminIds = space.adminIds || [];
  // Space-level admin: a global admin or a member listed in the space's admins.
  const isAdmin =
    !!currentUser && (currentUser.role === 'admin' || adminIds.includes(currentUser.id));
  const boards = space.boards || [];
  const members = space.users || [];

  const refresh = async () => {
    await fetchSpace();
  };

  const setAdmin = async (userId, makeAdmin) => {
    try {
      if (makeAdmin) {
        await api.post(`/spaces/${spaceId}/admins/${userId}`);
        toast.success('スペース管理者にしました。');
      } else {
        await api.delete(`/spaces/${spaceId}/admins/${userId}`);
        toast.success('スペース管理者を解除しました。');
      }
      await fetchSpace();
    } catch (err) {
      toast.error(err);
    }
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
          {isAdmin && (
            <Button variant="secondary" icon="settings" onClick={() => setEditOpen(true)}>
              編集
            </Button>
          )}
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
          {members.map(member => {
            const memberIsAdmin = adminIds.includes(member.id);
            return (
              <MemberRow key={member.id}>
                <Avatar size={32} avatarUrl={member.avatarUrl} name={member.name} />
                <MemberMeta>
                  <MemberName>{member.name}</MemberName>
                  <MemberEmail>{member.email}</MemberEmail>
                </MemberMeta>
                <RoleBadge admin={memberIsAdmin}>
                  {memberIsAdmin ? 'スペース管理者' : 'メンバー'}
                </RoleBadge>
                {isAdmin && (
                  <MemberActions>
                    {memberIsAdmin ? (
                      <Button variant="empty" onClick={() => setAdmin(member.id, false)}>
                        管理者を解除
                      </Button>
                    ) : (
                      <Button variant="empty" onClick={() => setAdmin(member.id, true)}>
                        管理者にする
                      </Button>
                    )}
                    {currentUser.id !== member.id && (
                      <ConfirmModal
                        title="このメンバーをスペースから外しますか？"
                        message="ユーザー自体は削除されません。"
                        confirmText="外す"
                        variant="danger"
                        onConfirm={({ close }) => removeMember(member.id).then(close)}
                        renderLink={({ open }) => (
                          <Button variant="empty" icon="trash" onClick={open} />
                        )}
                      />
                    )}
                  </MemberActions>
                )}
              </MemberRow>
            );
          })}
        </MemberList>

        {isEditOpen && (
          <Modal
            isOpen
            width={520}
            onClose={() => setEditOpen(false)}
            renderContent={modal => (
              <SpaceEditForm
                spaceId={spaceId}
                space={space}
                onSuccess={async () => {
                  await fetchSpace();
                  modal.close();
                  setEditOpen(false);
                }}
              />
            )}
          />
        )}

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

const SpaceEditForm = ({ spaceId, space, onSuccess }) => (
  <Form
    enableReinitialize
    initialValues={Form.initialValues(space, get => ({
      name: get('name', ''),
      icon: get('icon', null),
    }))}
    validations={{ name: [Form.is.required(), Form.is.maxLength(100)] }}
    onSubmit={async (values, form) => {
      try {
        await api.put(`/spaces/${spaceId}`, values);
        toast.success('スペースを更新しました。');
        onSuccess();
      } catch (error) {
        Form.handleAPIError(error, form);
      }
    }}
  >
    <FormElement>
      <FormHeading>スペースを編集</FormHeading>
      <Form.Field.Input name="name" label="名前" />
      <IconPicker />
      <Actions>
        <Button type="submit" variant="primary">
          更新
        </Button>
      </Actions>
    </FormElement>
  </Form>
);

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

const MemberForm = ({ spaceId, onSuccess }) => (
  <Form
    initialValues={{ emails: '' }}
    validations={{ emails: [Form.is.required()] }}
    onSubmit={async (values, form) => {
      try {
        const res = await api.post(`/spaces/${spaceId}/members`, { emails: values.emails });
        const added = res.added || 0;
        const sent = res.emailsSent || 0;
        toast.success(
          `${added} 人をメンバーに追加しました${sent ? `（招待メール ${sent} 件送信）` : ''}。`,
        );
        onSuccess();
      } catch (error) {
        Form.handleAPIError(error, form);
      }
    }}
  >
    <FormElement>
      <FormHeading>メンバーを追加</FormHeading>
      <Form.Field.Textarea
        name="emails"
        label="メールアドレス"
        tip="複数招待する場合はカンマまたは改行で区切ってください。各アドレスの Google アカウントでログインできるようになります（招待制）。"
      />
      <Actions>
        <Button type="submit" variant="primary">
          追加
        </Button>
      </Actions>
    </FormElement>
  </Form>
);

SpaceEditForm.propTypes = {
  spaceId: PropTypes.string.isRequired,
  space: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
BoardForm.propTypes = {
  spaceId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
MemberForm.propTypes = {
  spaceId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default SpaceBoards;
