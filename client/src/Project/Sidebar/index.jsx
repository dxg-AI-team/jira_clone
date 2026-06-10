import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom';

import { ProjectCategoryCopy } from 'shared/constants/projects';
import { Icon, ProjectAvatar } from 'shared/components';

import {
  Sidebar,
  ProjectInfo,
  ProjectTexts,
  ProjectName,
  ProjectCategory,
  Divider,
  LinkItem,
  LinkText,
  NotImplemented,
} from './Styles';

const propTypes = {
  project: PropTypes.object.isRequired,
};

const ProjectSidebar = ({ project }) => {
  const match = useRouteMatch();
  const history = useHistory();

  return (
    <Sidebar>
      <ProjectInfo
        onClick={() => history.push('/projects')}
        style={{ cursor: 'pointer' }}
        title="プロジェクトを切り替え"
      >
        <ProjectAvatar />
        <ProjectTexts>
          <ProjectName>{project.name} ▾</ProjectName>
          <ProjectCategory>{ProjectCategoryCopy[project.category]}プロジェクト</ProjectCategory>
        </ProjectTexts>
      </ProjectInfo>

      {renderLinkItem(match, '要約', 'reports', '/summary')}
      {renderLinkItem(match, 'カンバンボード', 'board', '/board')}
      {renderLinkItem(match, 'プロジェクト設定', 'settings', '/settings')}
      {renderLinkItem(match, 'ユーザー', 'menu', '/users')}
      <Divider />
      {renderLinkItem(match, 'リリース', 'shipping', '/releases')}
      {renderLinkItem(match, '課題とフィルター', 'issues', '/issues')}
      {renderLinkItem(match, 'ページ', 'page', '/pages')}
      {renderLinkItem(match, 'レポート', 'reports', '/reports')}
      {renderLinkItem(match, 'コンポーネント', 'component', '/components')}
    </Sidebar>
  );
};

const renderLinkItem = (match, text, iconType, path) => {
  const isImplemented = !!path;

  const linkItemProps = isImplemented
    ? { as: NavLink, exact: true, to: `${match.url}${path}` }
    : { as: 'div' };

  return (
    <LinkItem {...linkItemProps}>
      <Icon type={iconType} />
      <LinkText>{text}</LinkText>
      {!isImplemented && <NotImplemented>未実装</NotImplemented>}
    </LinkItem>
  );
};

ProjectSidebar.propTypes = propTypes;

export default ProjectSidebar;
