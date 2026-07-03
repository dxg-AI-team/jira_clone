import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import { getColumns, getColumnName, getDoneKey, columnColorForKey } from 'shared/utils/workflow';
import { Select, Icon, Modal, Textarea, Button } from 'shared/components';

import { SectionTitle } from '../Styles';
import {
  Status,
  ResolutionModal,
  ModalTitle,
  ModalHint,
  ModalActions,
  Resolution,
  ResolutionLabel,
} from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
};

const ProjectBoardIssueDetailsStatus = ({ issue, updateIssue, project }) => {
  const doneKey = getDoneKey(project);
  const [pendingReason, setPendingReason] = useState(null);

  // Moving an issue into the "done" column opens a prompt for the resolution
  // reason (mirroring JIRA's resolve dialog). Other transitions apply directly.
  // Moving out of "done" clears any previously recorded resolution.
  const handleChange = status => {
    if (status === issue.status) return;
    if (status === doneKey) {
      setPendingReason(issue.resolution || '');
    } else if (issue.status === doneKey) {
      updateIssue({ status, resolution: null });
    } else {
      updateIssue({ status });
    }
  };

  const confirmDone = () => {
    updateIssue({ status: doneKey, resolution: (pendingReason || '').trim() || null });
    setPendingReason(null);
  };

  return (
    <Fragment>
      <SectionTitle>ステータス</SectionTitle>
      <Select
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        name="status"
        value={issue.status}
        options={getColumns(project).map(column => ({
          value: column.key,
          label: column.name,
        }))}
        onChange={handleChange}
        renderValue={({ value: status }) => (
          <Status isValue bg={columnColorForKey(project, status)}>
            <div>{getColumnName(project, status)}</div>
            <Icon type="chevron-down" size={18} />
          </Status>
        )}
        renderOption={({ value: status }) => (
          <Status bg={columnColorForKey(project, status)}>{getColumnName(project, status)}</Status>
        )}
      />

      {issue.status === doneKey && issue.resolution && (
        <Fragment>
          <ResolutionLabel>解決理由</ResolutionLabel>
          <Resolution>{issue.resolution}</Resolution>
        </Fragment>
      )}

      {pendingReason !== null && (
        <Modal
          isOpen
          testid="modal:resolve-issue"
          width={480}
          withCloseIcon={false}
          onClose={() => setPendingReason(null)}
          renderContent={() => (
            <ResolutionModal>
              <ModalTitle>課題を完了にする</ModalTitle>
              <ModalHint>
                「{getColumnName(project, doneKey)}
                」に変更します。解決理由を入力してください（任意）。
              </ModalHint>
              <Textarea
                autoFocus
                minRows={3}
                placeholder="例: 修正をリリースしました / 再現しないためクローズ"
                value={pendingReason}
                onChange={setPendingReason}
              />
              <ModalActions>
                <Button variant="primary" onClick={confirmDone}>
                  完了にする
                </Button>
                <Button variant="empty" onClick={() => setPendingReason(null)}>
                  キャンセル
                </Button>
              </ModalActions>
            </ResolutionModal>
          )}
        />
      )}
    </Fragment>
  );
};

ProjectBoardIssueDetailsStatus.propTypes = propTypes;

export default ProjectBoardIssueDetailsStatus;
