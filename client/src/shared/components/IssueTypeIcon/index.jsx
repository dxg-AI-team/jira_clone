import React from 'react';
import PropTypes from 'prop-types';

import { TypeIcon } from './Styles';

const propTypes = {
  type: PropTypes.string.isRequired,
};

// The icon font has no dedicated "epic" glyph; reuse the component glyph for it.
const glyphForType = { epic: 'component' };

const IssueTypeIcon = ({ type, ...otherProps }) => (
  <TypeIcon type={glyphForType[type] || type} color={type} size={18} {...otherProps} />
);

IssueTypeIcon.propTypes = propTypes;

export default IssueTypeIcon;
