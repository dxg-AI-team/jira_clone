import React from 'react';
import PropTypes from 'prop-types';

import { ErrorPage, ErrorPageInner, ErrorBox, StyledIcon, Title } from './Styles';

const propTypes = {
  title: PropTypes.node,
  message: PropTypes.node,
};

const defaultProps = {
  title: '問題が発生しました…',
  message: (
    <p>
      原因を特定できませんでした。お問い合わせいただくか、
      <a href="https://support.atlassian.com/jira-software-cloud/">ヘルプセンター</a>
      をご覧ください。
    </p>
  ),
};

const PageError = ({ title, message }) => (
  <ErrorPage>
    <ErrorPageInner>
      <ErrorBox>
        <StyledIcon type="bug" />
        <Title>{title}</Title>
        {message}
      </ErrorBox>
    </ErrorPageInner>
  </ErrorPage>
);

PageError.propTypes = propTypes;
PageError.defaultProps = defaultProps;

export default PageError;
