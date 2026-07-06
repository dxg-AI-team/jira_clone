import React from 'react';
import { Route, Redirect, Link, useRouteMatch, useHistory, useParams } from 'react-router-dom';

import useApi from 'shared/hooks/api';
import { updateArrayItemById } from 'shared/utils/javascript';
import { setCurrentProjectId } from 'shared/utils/currentProject';
import { createQueryParamModalHelpers } from 'shared/utils/queryParamModal';
import { PageLoader, PageError, Modal } from 'shared/components';

import NavbarLeft from './NavbarLeft';
import Sidebar from './Sidebar';
import Board from './Board';
import Backlog from './Backlog';
import IssueSearch from './IssueSearch';
import IssueCreate from './IssueCreate';
import ProjectSettings from './ProjectSettings';
import Users from './Users';
import Releases from './Releases';
import IssuesAndFilters from './IssuesAndFilters';
import Components from './Components';
import Reports from './Reports';
import Pages from './Pages';
import Summary from './Summary';
import Import from './Import';
import { ProjectPage } from './Styles';

const Project = () => {
  const match = useRouteMatch();
  const history = useHistory();
  const { projectId } = useParams();

  // Make every project-scoped API request target this project (sent as the
  // X-Project-Id header) and key the cache per project.
  setCurrentProjectId(projectId);

  const issueSearchModalHelpers = createQueryParamModalHelpers('issue-search');
  const issueCreateModalHelpers = createQueryParamModalHelpers('issue-create');

  const [{ data, error, setLocalData }, fetchProject] = useApi.get('/project', { projectId });

  if (error) {
    if (error.code === 'ENTITY_NOT_FOUND' || error.status === 404) {
      return (
        <PageError
          title="ボードが見つかりません"
          message={
            <p>
              このボードは削除されたか、URL が正しくない可能性があります。
              <br />
              <Link to="/spaces">プロジェクト一覧へ戻る</Link>
            </p>
          }
        />
      );
    }
    if (error.code === 'FORBIDDEN' || error.status === 403) {
      return (
        <PageError
          title="アクセス権限がありません"
          message={
            <p>
              このボードを表示する権限がありません。
              <br />
              <Link to="/spaces">プロジェクト一覧へ戻る</Link>
            </p>
          }
        />
      );
    }
    return <PageError />;
  }
  if (!data) return <PageLoader />;

  const { project } = data;

  const updateLocalProjectIssues = (issueId, updatedFields) => {
    setLocalData(currentData => ({
      project: {
        ...currentData.project,
        issues: updateArrayItemById(currentData.project.issues, issueId, updatedFields),
      },
    }));
  };

  return (
    <ProjectPage>
      <NavbarLeft
        issueSearchModalOpen={issueSearchModalHelpers.open}
        issueCreateModalOpen={issueCreateModalHelpers.open}
      />

      <Sidebar project={project} />

      {issueSearchModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-search"
          variant="aside"
          width={600}
          onClose={issueSearchModalHelpers.close}
          renderContent={() => <IssueSearch project={project} />}
        />
      )}

      {issueCreateModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-create"
          width={800}
          withCloseIcon={false}
          onClose={issueCreateModalHelpers.close}
          renderContent={modal => (
            <IssueCreate
              project={project}
              fetchProject={fetchProject}
              onCreate={() => history.push(`${match.url}/board`)}
              modalClose={modal.close}
            />
          )}
        />
      )}

      <Route
        path={`${match.path}/board`}
        render={() => (
          <Board
            project={project}
            fetchProject={fetchProject}
            updateLocalProjectIssues={updateLocalProjectIssues}
          />
        )}
      />

      <Route
        path={`${match.path}/backlog`}
        render={() => <Backlog project={project} fetchProject={fetchProject} />}
      />

      <Route
        path={`${match.path}/settings`}
        render={() => <ProjectSettings project={project} fetchProject={fetchProject} />}
      />

      <Route
        path={`${match.path}/users`}
        render={() => <Users project={project} fetchProject={fetchProject} />}
      />

      <Route
        path={`${match.path}/releases`}
        render={() => <Releases project={project} fetchProject={fetchProject} />}
      />

      <Route path={`${match.path}/issues`} render={() => <IssuesAndFilters project={project} />} />

      <Route
        path={`${match.path}/components`}
        render={() => <Components project={project} fetchProject={fetchProject} />}
      />

      <Route path={`${match.path}/reports`} render={() => <Reports project={project} />} />

      <Route path={`${match.path}/pages`} render={() => <Pages />} />

      <Route path={`${match.path}/summary`} render={() => <Summary project={project} />} />

      <Route
        path={`${match.path}/import`}
        render={() => <Import project={project} fetchProject={fetchProject} />}
      />

      {match.isExact && <Redirect to={`${match.url}/summary`} />}
    </ProjectPage>
  );
};

export default Project;
