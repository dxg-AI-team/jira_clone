import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'shared/components';

import { SectionTitle } from '../Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  projectVersions: PropTypes.array.isRequired,
};

const ProjectBoardIssueDetailsVersion = ({ issue, updateIssue, projectVersions }) => (
  <Fragment>
    <SectionTitle>リリース</SectionTitle>
    <Select
      dropdownWidth={343}
      placeholder="リリースなし"
      name="version"
      value={issue.versionId || undefined}
      options={projectVersions.map(version => ({ value: version.id, label: version.name }))}
      onChange={versionId => updateIssue({ versionId: versionId || null })}
    />
  </Fragment>
);

ProjectBoardIssueDetailsVersion.propTypes = propTypes;

export default ProjectBoardIssueDetailsVersion;
