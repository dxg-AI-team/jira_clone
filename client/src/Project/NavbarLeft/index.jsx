import React from 'react';
import PropTypes from 'prop-types';

import history from 'browserHistory';
import { removeStoredAuthToken } from 'shared/utils/authToken';
import { Icon, AboutTooltip } from 'shared/components';

import Notifications from './Notifications';
import { NavLeft, LogoLink, StyledLogo, Bottom, Item, ItemText } from './Styles';

const propTypes = {
  issueSearchModalOpen: PropTypes.func.isRequired,
  issueCreateModalOpen: PropTypes.func.isRequired,
};

const handleLogout = () => {
  removeStoredAuthToken();
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  history.push('/authenticate');
};

const ProjectNavbarLeft = ({ issueSearchModalOpen, issueCreateModalOpen }) => (
  <NavLeft>
    <LogoLink to="/">
      <StyledLogo color="#fff" />
    </LogoLink>

    <Item onClick={issueSearchModalOpen}>
      <Icon type="search" size={22} top={1} left={3} />
      <ItemText>課題を検索</ItemText>
    </Item>

    <Item onClick={issueCreateModalOpen}>
      <Icon type="plus" size={27} />
      <ItemText>課題を作成</ItemText>
    </Item>

    <Notifications />

    <Bottom>
      <Item onClick={handleLogout}>
        <Icon type="arrow-left-circle" size={25} />
        <ItemText>ログアウト</ItemText>
      </Item>
      <AboutTooltip
        placement="right"
        offset={{ top: -218 }}
        renderLink={linkProps => (
          <Item {...linkProps}>
            <Icon type="help" size={25} />
            <ItemText>このアプリについて</ItemText>
          </Item>
        )}
      />
    </Bottom>
  </NavLeft>
);

ProjectNavbarLeft.propTypes = propTypes;

export default ProjectNavbarLeft;
