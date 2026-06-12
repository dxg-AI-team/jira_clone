import React from 'react';
import PropTypes from 'prop-types';

import { TypeIcon } from './Styles';

const propTypes = {
  type: PropTypes.string.isRequired,
};

// The icon font has no dedicated "epic"/"subtask" glyph; reuse existing glyphs.
const glyphForType = { epic: 'component', subtask: 'task' };

const IssueTypeIcon = ({ type, ...otherProps }) => (
  <TypeIcon type={glyphForType[type] || type} color={type} size={18} {...otherProps} />
);

IssueTypeIcon.propTypes = propTypes;

export default IssueTypeIcon;
