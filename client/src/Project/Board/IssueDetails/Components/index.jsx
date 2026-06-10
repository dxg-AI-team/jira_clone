import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'shared/components';

import { SectionTitle } from '../Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  projectComponents: PropTypes.array.isRequired,
};

const ProjectBoardIssueDetailsComponents = ({ issue, updateIssue, projectComponents }) => {
  const getComponentById = componentId => projectComponents.find(c => c.id === componentId);

  return (
    <Fragment>
      <SectionTitle>コンポーネント</SectionTitle>
      <Select
        isMulti
        dropdownWidth={343}
        placeholder="コンポーネントなし"
        name="components"
        value={issue.componentIds || []}
        options={projectComponents.map(component => ({
          value: component.id,
          label: component.name,
        }))}
        onChange={componentIds =>
          updateIssue({
            componentIds,
            components: componentIds.map(getComponentById),
          })
        }
      />
    </Fragment>
  );
};

ProjectBoardIssueDetailsComponents.propTypes = propTypes;

export default ProjectBoardIssueDetailsComponents;
