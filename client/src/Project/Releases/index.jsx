import React, { useState } from 'react';
import PropTypes from 'prop-types';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { formatDate } from 'shared/utils/dateTime';
import { IssueStatus } from 'shared/constants/issues';
import { Button, ConfirmModal, Modal, Form } from 'shared/components';

import {
  Page,
  Header,
  Title,
  Empty,
  VersionList,
  VersionRow,
  VersionMain,
  VersionNameRow,
  VersionName,
  ReleasedBadge,
  VersionDate,
  Progress,
  ProgressText,
  ProgressBar,
  ProgressFill,
  RowActions,
  FormHeading,
  FormElement,
  Actions,
  ActionButton,
} from './Styles';

const releasedOptions = [
  { value: false, label: '未リリース' },
  { value: true, label: 'リリース済み' },
];

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectReleases = ({ project, fetchProject }) => {
  // null = modal closed, {} = create, version object = edit
  const [modalVersion, setModalVersion] = useState(null);

  const versions = project.versions || [];
  const issues = project.issues || [];

  const versionProgress = versionId => {
    const versionIssues = issues.filter(issue => issue.versionId === versionId);
    const total = versionIssues.length;
    const done = versionIssues.filter(issue => issue.status === IssueStatus.DONE).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  };

  const handleDelete = async versionId => {
    try {
      await api.delete(`/versions/${versionId}`);
      await fetchProject();
      toast.success('リリースを削除しました。');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Page>
      <Header>
        <Title>リリース</Title>
        <Button variant="primary" onClick={() => setModalVersion({})}>
          リリースを作成
        </Button>
      </Header>

      {versions.length === 0 ? (
        <Empty>リリースはまだありません。「リリースを作成」から追加してください。</Empty>
      ) : (
        <VersionList>
          {versions.map(version => {
            const { total, done, percent } = versionProgress(version.id);
            return (
              <VersionRow key={version.id}>
                <VersionMain>
                  <VersionNameRow>
                    <VersionName>{version.name}</VersionName>
                    {version.released && <ReleasedBadge>リリース済み</ReleasedBadge>}
                  </VersionNameRow>
                  {version.releaseDate && (
                    <VersionDate>リリース日: {formatDate(version.releaseDate)}</VersionDate>
                  )}
                </VersionMain>

                <Progress>
                  <ProgressText>
                    {done} / {total} 件完了（{percent}%）
                  </ProgressText>
                  <ProgressBar>
                    <ProgressFill percent={percent} />
                  </ProgressBar>
                </Progress>

                <RowActions>
                  <Button variant="secondary" onClick={() => setModalVersion(version)}>
                    編集
                  </Button>
                  <ConfirmModal
                    title="このリリースを削除しますか？"
                    message="削除しても課題は残り、課題からリリースの紐付けが外れるだけです。"
                    confirmText="削除"
                    variant="danger"
                    onConfirm={({ close }) => handleDelete(version.id).then(close)}
                    renderLink={({ open }) => (
                      <Button variant="empty" icon="trash" onClick={open} />
                    )}
                  />
                </RowActions>
              </VersionRow>
            );
          })}
        </VersionList>
      )}

      {modalVersion && (
        <Modal
          isOpen
          width={520}
          onClose={() => setModalVersion(null)}
          renderContent={modal => (
            <VersionForm
              version={modalVersion.id ? modalVersion : null}
              onSuccess={async () => {
                await fetchProject();
                modal.close();
                setModalVersion(null);
              }}
            />
          )}
        />
      )}
    </Page>
  );
};

const versionFormPropTypes = {
  version: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

const VersionForm = ({ version, onSuccess }) => {
  const isEdit = !!version;

  return (
    <Form
      enableReinitialize
      initialValues={Form.initialValues(version || {}, get => ({
        name: get('name', ''),
        description: get('description', ''),
        releaseDate: get('releaseDate', ''),
        released: get('released', false),
      }))}
      validations={{
        name: [Form.is.required(), Form.is.maxLength(100)],
      }}
      onSubmit={async (values, form) => {
        try {
          if (isEdit) {
            await api.put(`/versions/${version.id}`, values);
            toast.success('リリースを更新しました。');
          } else {
            await api.post('/versions', values);
            toast.success('リリースを作成しました。');
          }
          onSuccess();
        } catch (error) {
          Form.handleAPIError(error, form);
        }
      }}
    >
      <FormElement>
        <FormHeading>{isEdit ? 'リリースを編集' : 'リリースを作成'}</FormHeading>
        <Form.Field.Input name="name" label="名前" tip="例: v1.0, 2026年6月リリース" />
        <Form.Field.Textarea name="description" label="説明" />
        <Form.Field.DatePicker name="releaseDate" label="リリース日" withTime={false} />
        <Form.Field.Select name="released" label="ステータス" options={releasedOptions} />
        <Actions>
          <ActionButton type="submit" variant="primary">
            {isEdit ? '更新' : '作成'}
          </ActionButton>
        </Actions>
      </FormElement>
    </Form>
  );
};

ProjectReleases.propTypes = propTypes;
VersionForm.propTypes = versionFormPropTypes;
VersionForm.defaultProps = { version: null };

export default ProjectReleases;
