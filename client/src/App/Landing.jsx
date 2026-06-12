import React from 'react';
import { Redirect } from 'react-router-dom';

import useApi from 'shared/hooks/api';
import { setCurrentProjectId } from 'shared/utils/currentProject';
import { PageLoader } from 'shared/components';

// Initial landing: send the user into their first space. Falls back to the
// space list when they don't belong to any space yet.
const Landing = () => {
  setCurrentProjectId(null);

  const [{ data, isLoading }] = useApi.get('/spaces');

  if (isLoading && !data) return <PageLoader />;

  const spaces = (data && data.spaces) || [];
  if (spaces.length === 0) return <Redirect to="/spaces" />;

  const first = [...spaces].sort((a, b) => a.id - b.id)[0];
  return <Redirect to={`/space/${first.id}`} />;
};

export default Landing;
