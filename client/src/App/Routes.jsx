import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';

import history from 'browserHistory';
import Project from 'Project';
import Spaces from 'Spaces';
import SpaceBoards from 'SpaceBoards';
import UsersAdmin from 'UsersAdmin';
import Landing from 'App/Landing';
import Authenticate from 'Auth/Authenticate';
import PageError from 'shared/components/PageError';

const Routes = () => (
  <Router history={history}>
    <Switch>
      <Route path="/" exact component={Landing} />
      <Route path="/authenticate" component={Authenticate} />
      <Route path="/spaces" exact component={Spaces} />
      <Route path="/admin/users" exact component={UsersAdmin} />
      <Route path="/space/:spaceId" exact component={SpaceBoards} />
      <Route path="/project/:projectId" component={Project} />
      <Route component={PageError} />
    </Switch>
  </Router>
);

export default Routes;
