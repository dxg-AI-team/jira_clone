import React from 'react';
import { Redirect } from 'react-router-dom';

import useApi from 'shared/hooks/api';
import { setCurrentProjectId } from 'shared/utils/currentProject';
import { PageLoader } from 'shared/components';

// Initial landing: send the user straight into their first project. Falls back
// to the project list when they don't belong to any project yet.
const Landing = () => {
  setCurrentProjectId(null);

  const [{ data, isLoading }] = useApi.get('/projects');

  if (isLoading && !data) return <PageLoader />;

  const projects = (data && data.projects) || [];
  if (projects.length === 0) return <Redirect to="/projects" />;

  const first = [...projects].sort((a, b) => a.id - b.id)[0];
  return <Redirect to={`/project/${first.id}/summary`} />;
};

export default Landing;
