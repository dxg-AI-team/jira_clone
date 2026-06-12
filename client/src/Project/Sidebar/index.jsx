import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom';

import useApi from 'shared/hooks/api';
import useOnOutsideClick from 'shared/hooks/onOutsideClick';
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

  const { spaceId } = project;
  const [{ data: boardsData }] = useApi.get('/boards', { spaceId });
  const boards = (boardsData && boardsData.boards) || [];
  const spaceName = project.space ? project.space.name : '';

  const goToBoard = boardId => {
    setSwitcherOpen(false);
    history.push(`/project/${boardId}/summary`);
  };

  return (
    <Sidebar>
      <Switcher ref={switcherRef}>
        <ProjectInfo onClick={() => setSwitcherOpen(!isSwitcherOpen)} title="ボードを切り替え">
          <ProjectAvatar name={project.name} icon={project.icon} avatarUrl={project.avatarUrl} />
          <ProjectTexts>
            <ProjectName>{project.name} ▾</ProjectName>
            <ProjectCategory>{spaceName}</ProjectCategory>
          </ProjectTexts>
        </ProjectInfo>

        {isSwitcherOpen && (
          <SwitcherDropdown>
            {boards.map(b => (
              <SwitcherItem
                key={b.id}
                isActive={b.id === project.id}
                onClick={() => goToBoard(b.id)}
              >
                {b.name}
              </SwitcherItem>
            ))}
            <SwitcherDivider />
            {spaceId && (
              <SwitcherFooter onClick={() => history.push(`/space/${spaceId}`)}>
                スペースのボード一覧
              </SwitcherFooter>
            )}
            <SwitcherFooter onClick={() => history.push('/spaces')}>
              すべてのスペース
            </SwitcherFooter>
          </SwitcherDropdown>
        )}
      </Switcher>

      {renderLinkItem(match, '要約', 'reports', '/summary')}
      {renderLinkItem(match, 'カンバンボード', 'board', '/board')}
      {renderLinkItem(match, 'ボード設定', 'settings', '/settings')}
      {renderLinkItem(match, 'メンバー', 'menu', '/users')}
      {renderLinkItem(match, 'インポート', 'attach', '/import')}
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
