import React from 'react';
import PropTypes from 'prop-types';

import { IssueType, IssueTypeCopy } from 'shared/constants/issues';
import { issueKey } from 'shared/utils/issueKey';
import { IssueTypeIcon, Select } from 'shared/components';

import { TypeButton, Type, TypeLabel } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  project: PropTypes.object,
  updateIssue: PropTypes.func.isRequired,
};

const defaultProps = {
  project: null,
};

const ProjectBoardIssueDetailsType = ({ issue, project, updateIssue }) => (
  <Select
    variant="empty"
    dropdownWidth={150}
    withClearValue={false}
    name="type"
    value={issue.type}
    options={Object.values(IssueType).map(type => ({
      value: type,
      label: IssueTypeCopy[type],
    }))}
    onChange={type => updateIssue({ type })}
    renderValue={({ value: type }) => (
      <TypeButton variant="empty" icon={<IssueTypeIcon type={type} />}>
        {issueKey(project, issue)}
      </TypeButton>
    )}
    renderOption={({ value: type }) => (
      <Type key={type} onClick={() => updateIssue({ type })}>
        <IssueTypeIcon type={type} top={1} />
        <TypeLabel>{IssueTypeCopy[type]}</TypeLabel>
      </Type>
    )}
  />
);

ProjectBoardIssueDetailsType.propTypes = propTypes;
ProjectBoardIssueDetailsType.defaultProps = defaultProps;

export default ProjectBoardIssueDetailsType;
