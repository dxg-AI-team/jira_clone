import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Route, useRouteMatch, useHistory } from 'react-router-dom';

import useMergeState from 'shared/hooks/mergeState';
import { Breadcrumbs, Modal } from 'shared/components';

import Header from './Header';
import Filters from './Filters';
import Lists from './Lists';
import IssueDetails from './IssueDetails';

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
  updateLocalProjectIssues: PropTypes.func.isRequired,
};

const defaultFilters = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false,
};

const ProjectBoard = ({ project, fetchProject, updateLocalProjectIssues }) => {
  const match = useRouteMatch();
  const history = useHistory();

  const [filters, mergeFilters] = useMergeState(defaultFilters);

  // When a sprint is active, the board shows only that sprint's issues
  // (Scrum board). Otherwise it shows every issue (Kanban-style).
  const activeSprint = (project.sprints || []).find(sprint => sprint.status === 'active');
  const boardProject = activeSprint
    ? { ...project, issues: project.issues.filter(issue => issue.sprintId === activeSprint.id) }
    : project;

  return (
    <Fragment>
      <Breadcrumbs
        items={[
          project.space ? project.space.name : 'スペース',
          project.name,
          activeSprint ? activeSprint.name : 'カンバンボード',
        ]}
      />
      <Header />
      <Filters
        projectUsers={project.users}
        defaultFilters={defaultFilters}
        filters={filters}
        mergeFilters={mergeFilters}
      />
      <Lists
        project={boardProject}
        filters={filters}
        updateLocalProjectIssues={updateLocalProjectIssues}
      />
      <Route
        path={`${match.path}/issues/:issueId`}
        render={routeProps => (
          <Modal
            isOpen
            testid="modal:issue-details"
            width={1040}
            withCloseIcon={false}
            onClose={() => history.push(match.url)}
            renderContent={modal => (
              <IssueDetails
                issueId={routeProps.match.params.issueId}
                projectUsers={project.users}
                projectVersions={project.versions}
                projectComponents={project.components}
                projectIssues={project.issues}
                fetchProject={fetchProject}
                updateLocalProjectIssues={updateLocalProjectIssues}
                modalClose={modal.close}
              />
            )}
          />
        )}
      />
    </Fragment>
  );
};

ProjectBoard.propTypes = propTypes;

export default ProjectBoard;
