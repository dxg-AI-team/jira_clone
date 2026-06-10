import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom';

import useApi from 'shared/hooks/api';
import useOnOutsideClick from 'shared/hooks/onOutsideClick';
import { ProjectCategoryCopy } from 'shared/constants/projects';
import { Icon, ProjectAvatar } from 'shared/components';

import {
  Sidebar,
  Switcher,
  ProjectInfo,
  ProjectTexts,
  ProjectName,
  ProjectCategory,
  SwitcherDropdown,
  SwitcherItem,
  SwitcherDivider,
  SwitcherFooter,
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

  const [isSwitcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef();
  useOnOutsideClick(switcherRef, isSwitcherOpen, () => setSwitcherOpen(false));

  const [{ data: projectsData }] = useApi.get('/projects');
  const projects = (projectsData && projectsData.projects) || [];

  const goToProject = projectId => {
    setSwitcherOpen(false);
    history.push(`/project/${projectId}/summary`);
  };

  return (
    <Sidebar>
      <Switcher ref={switcherRef}>
        <ProjectInfo
          onClick={() => setSwitcherOpen(!isSwitcherOpen)}
          title="プロジェクトを切り替え"
        >
          <ProjectAvatar name={project.name} icon={project.icon} avatarUrl={project.avatarUrl} />
          <ProjectTexts>
            <ProjectName>{project.name} ▾</ProjectName>
            <ProjectCategory>{ProjectCategoryCopy[project.category]}プロジェクト</ProjectCategory>
          </ProjectTexts>
        </ProjectInfo>

        {isSwitcherOpen && (
          <SwitcherDropdown>
            {projects.map(p => (
              <SwitcherItem
                key={p.id}
                isActive={p.id === project.id}
                onClick={() => goToProject(p.id)}
              >
                {p.name}
              </SwitcherItem>
            ))}
            <SwitcherDivider />
            <SwitcherFooter onClick={() => history.push('/projects')}>
              すべてのプロジェクト
            </SwitcherFooter>
          </SwitcherDropdown>
        )}
      </Switcher>

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
