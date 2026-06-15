import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { Button, Select } from 'shared/components';
import { getColumnName, columnColorForKey } from 'shared/utils/workflow';
import { getCurrentProjectId } from 'shared/utils/currentProject';

import { SectionTitle } from '../Styles';
import {
  LinkGroup,
  GroupLabel,
  LinkRow,
  LinkTitle,
  StatusTag,
  AddForm,
  FieldRow,
  Actions,
} from './Styles';

const LINK_TYPE_COPY = {
  blocks: 'ブロックしている',
  is_blocked_by: 'ブロックされている',
  relates: '関連している',
  duplicates: '重複している',
  is_duplicated_by: '重複元',
};

const linkTypeOptions = Object.keys(LINK_TYPE_COPY).map(value => ({
  value,
  label: LINK_TYPE_COPY[value],
}));

const propTypes = {
  issue: PropTypes.object.isRequired,
  projectIssues: PropTypes.array.isRequired,
  fetchIssue: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
};

const IssueLinks = ({ issue, projectIssues, fetchIssue, project }) => {
  const history = useHistory();
  const [isAdding, setAdding] = useState(false);
  const [type, setType] = useState('relates');
  const [targetIssueId, setTargetIssueId] = useState(null);
  const [isWorking, setWorking] = useState(false);

  const links = issue.issueLinks || [];

  const issueOptions = projectIssues
    .filter(i => i.id !== issue.id)
    .map(i => ({ value: i.id, label: `${i.title}` }));

  const goToIssue = issueId =>
    history.push(`/project/${getCurrentProjectId()}/board/issues/${issueId}`);

  const handleAdd = async () => {
    if (!targetIssueId) {
      toast.error('リンク先の課題を選択してください。');
      return;
    }
    setWorking(true);
    try {
      await api.post('/issue-links', { sourceIssueId: issue.id, targetIssueId, type });
      await fetchIssue();
      setAdding(false);
      setTargetIssueId(null);
      setType('relates');
    } catch (error) {
      toast.error(error);
    }
    setWorking(false);
  };

  const handleDelete = async linkId => {
    try {
      await api.delete(`/issue-links/${linkId}`);
      await fetchIssue();
    } catch (error) {
      toast.error(error);
    }
  };

  // Group links by their (this-issue-perspective) type.
  const grouped = links.reduce((acc, link) => {
    (acc[link.type] = acc[link.type] || []).push(link);
    return acc;
  }, {});

  return (
    <Fragment>
      <SectionTitle>課題リンク</SectionTitle>

      {Object.keys(grouped).map(linkType => (
        <LinkGroup key={linkType}>
          <GroupLabel>{LINK_TYPE_COPY[linkType] || linkType}</GroupLabel>
          {grouped[linkType].map(link => (
            <LinkRow key={link.id}>
              {link.issue && (
                <StatusTag bg={columnColorForKey(project, link.issue.status)}>
                  {getColumnName(project, link.issue.status)}
                </StatusTag>
              )}
              <LinkTitle onClick={() => link.issue && goToIssue(link.issue.id)}>
                {link.issue ? link.issue.title : '(削除された課題)'}
              </LinkTitle>
              <Button variant="empty" icon="trash" onClick={() => handleDelete(link.id)} />
            </LinkRow>
          ))}
        </LinkGroup>
      ))}

      {isAdding ? (
        <AddForm>
          <FieldRow>
            <Select
              variant="normal"
              value={type}
              options={linkTypeOptions}
              onChange={setType}
              withClearValue={false}
            />
          </FieldRow>
          <FieldRow>
            <Select
              variant="normal"
              placeholder="リンク先の課題"
              value={targetIssueId}
              options={issueOptions}
              onChange={setTargetIssueId}
            />
          </FieldRow>
          <Actions>
            <Button variant="primary" isWorking={isWorking} onClick={handleAdd}>
              追加
            </Button>
            <Button variant="empty" onClick={() => setAdding(false)}>
              キャンセル
            </Button>
          </Actions>
        </AddForm>
      ) : (
        <Button variant="empty" icon="link" onClick={() => setAdding(true)}>
          リンクを追加
        </Button>
      )}
    </Fragment>
  );
};

IssueLinks.propTypes = propTypes;

export default IssueLinks;
