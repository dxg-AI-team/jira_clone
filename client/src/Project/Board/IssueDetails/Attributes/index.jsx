import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Select, InputDebounced, DatePicker } from 'shared/components';

import { SectionTitle } from '../Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
  projectIssues: PropTypes.array.isRequired,
};

const ProjectBoardIssueDetailsAttributes = ({ issue, updateIssue, projectIssues }) => {
  const labelValues = issue.labels || [];
  const allLabels = Array.from(
    new Set([...projectIssues.flatMap(i => i.labels || []), ...labelValues]),
  );
  const labelOptions = allLabels.map(label => ({ value: label, label }));

  const parentOptions = projectIssues
    .filter(i => i.id !== issue.id)
    .map(i => ({ value: i.id, label: i.title }));

  return (
    <Fragment>
      <SectionTitle>親課題</SectionTitle>
      <Select
        dropdownWidth={343}
        placeholder="親課題なし"
        name="parent"
        value={issue.parentId || undefined}
        options={parentOptions}
        onChange={parentId => updateIssue({ parentId: parentId || null })}
      />

      <SectionTitle>ラベル</SectionTitle>
      <Select
        isMulti
        dropdownWidth={343}
        placeholder="ラベルなし"
        name="labels"
        value={labelValues}
        options={labelOptions}
        onChange={labels => updateIssue({ labels })}
        onCreate={label => updateIssue({ labels: [...labelValues, label] })}
      />

      <SectionTitle>ストーリーポイント</SectionTitle>
      <InputDebounced
        placeholder="数値"
        filter={/^\d{0,3}$/}
        value={issue.storyPoints != null ? `${issue.storyPoints}` : ''}
        onChange={value => updateIssue({ storyPoints: value ? Number(value) : null })}
      />

      <SectionTitle>期日</SectionTitle>
      <DatePicker
        withTime={false}
        value={issue.dueDate || undefined}
        onChange={dueDate => updateIssue({ dueDate: dueDate || null })}
      />
    </Fragment>
  );
};

ProjectBoardIssueDetailsAttributes.propTypes = propTypes;

export default ProjectBoardIssueDetailsAttributes;
