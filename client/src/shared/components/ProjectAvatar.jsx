import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { font } from 'shared/utils/styles';

const propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  size: PropTypes.number,
};

const defaultProps = {
  className: undefined,
  name: '',
  icon: null,
  size: 40,
};

const colors = [
  '#DA7657',
  '#6ADA57',
  '#5784DA',
  '#AA57DA',
  '#DA5757',
  '#DA5792',
  '#57DACA',
  '#57A5DA',
];

const getColorFromName = name =>
  colors[(name || 'P').toLocaleLowerCase().charCodeAt(0) % colors.length];

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 5px;
  color: #fff;
  background: ${props => props.bg};
  ${props => font.size(Math.round(props.size * 0.5))}
  ${font.medium}
`;

const ProjectAvatar = ({ className, name, icon, size }) => (
  <Box className={className} size={size} bg={getColorFromName(name)}>
    {icon || (name || 'P').charAt(0).toUpperCase()}
  </Box>
);

ProjectAvatar.propTypes = propTypes;
ProjectAvatar.defaultProps = defaultProps;

export default ProjectAvatar;
