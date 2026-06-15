import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { getColumns, getColumnName, columnColorForKey } from 'shared/utils/workflow';
import { Select, Icon } from 'shared/components';

import { SectionTitle } from '../Styles';
import { Status } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
};

const ProjectBoardIssueDetailsStatus = ({ issue, updateIssue, project }) => (
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
      onChange={status => updateIssue({ status })}
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
  </Fragment>
);

ProjectBoardIssueDetailsStatus.propTypes = propTypes;

export default ProjectBoardIssueDetailsStatus;
