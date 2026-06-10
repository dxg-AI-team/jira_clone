import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';

import history from 'browserHistory';
import Project from 'Project';
import ProjectsList from 'Projects';
import Landing from 'App/Landing';
import Authenticate from 'Auth/Authenticate';
import PageError from 'shared/components/PageError';

const Routes = () => (
  <Router history={history}>
    <Switch>
      <Route path="/" exact component={Landing} />
      <Route path="/authenticate" component={Authenticate} />
      <Route path="/projects" exact component={ProjectsList} />
      <Route path="/project/:projectId" component={Project} />
      <Route component={PageError} />
    </Switch>
  </Router>
);

export default Routes;
