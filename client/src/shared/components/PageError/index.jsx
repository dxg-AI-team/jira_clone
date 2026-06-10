import React from 'react';

import { ErrorPage, ErrorPageInner, ErrorBox, StyledIcon, Title } from './Styles';

const PageError = () => (
  <ErrorPage>
    <ErrorPageInner>
      <ErrorBox>
        <StyledIcon type="bug" />
        <Title>問題が発生しました…</Title>
        <p>
          原因を特定できませんでした。お問い合わせいただくか、
          <a href="https://support.atlassian.com/jira-software-cloud/">ヘルプセンター</a>
          をご覧ください。
        </p>
      </ErrorBox>
    </ErrorPageInner>
  </ErrorPage>
);

export default PageError;
