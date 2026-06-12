import * as authentication from 'controllers/authentication';
import * as comments from 'controllers/comments';
import * as components from 'controllers/components';
import * as exporter from 'controllers/export';
import * as importer from 'controllers/import';
import * as issues from 'controllers/issues';
import * as pages from 'controllers/pages';
import * as projects from 'controllers/projects';
import * as spaces from 'controllers/spaces';
import * as test from 'controllers/test';
import * as users from 'controllers/users';
import * as versions from 'controllers/versions';

export const attachPublicRoutes = (app: any): void => {
  if (process.env.NODE_ENV === 'test') {
    app.delete('/test/reset-database', test.resetDatabase);
    app.post('/test/create-account', test.createAccount);
  }

  app.post('/authentication/guest', authentication.createGuestAccount);
  app.post('/authentication/google', authentication.googleLogin);
};

export const attachPrivateRoutes = (app: any): void => {
  app.post('/comments', comments.create);
  app.put('/comments/:commentId', comments.update);
  app.delete('/comments/:commentId', comments.remove);

  app.get('/issues', issues.getProjectIssues);
  app.get('/issues/:issueId', issues.getIssueWithUsersAndComments);
  app.post('/issues', issues.create);
  app.put('/issues/:issueId', issues.update);
  app.delete('/issues/:issueId', issues.remove);

  app.get('/spaces', spaces.getMySpaces);
  app.post('/spaces', spaces.create);
  app.get('/spaces/:spaceId', spaces.getSpace);
  app.put('/spaces/:spaceId', spaces.update);
  app.delete('/spaces/:spaceId', spaces.remove);
  app.post('/spaces/:spaceId/members', spaces.addMember);
  app.delete('/spaces/:spaceId/members/:userId', spaces.removeMember);

  app.get('/boards', projects.getSpaceBoards);
  app.post('/projects', projects.create);
  app.delete('/projects/:projectId', projects.remove);

  app.get('/project', projects.getProjectWithUsersAndIssues);
  app.put('/project', projects.update);
  app.post('/project/members', users.addMember);
  app.delete('/project/members/:userId', users.removeMember);

  app.get('/currentUser', users.getCurrentUser);

  app.get('/users/all', users.getAllUsers);
  app.get('/users', users.getProjectUsers);
  app.post('/users', users.create);
  app.put('/users/:userId', users.update);
  app.delete('/users/:userId', users.remove);

  app.get('/versions', versions.getProjectVersions);
  app.post('/versions', versions.create);
  app.put('/versions/:versionId', versions.update);
  app.delete('/versions/:versionId', versions.remove);

  app.get('/components', components.getProjectComponents);
  app.post('/components', components.create);
  app.put('/components/:componentId', components.update);
  app.delete('/components/:componentId', components.remove);

  app.post('/import', importer.importIssues);
  app.get('/export', exporter.exportIssues);

  app.get('/pages', pages.getProjectPages);
  app.get('/pages/:pageId', pages.getPage);
  app.post('/pages', pages.create);
  app.put('/pages/:pageId', pages.update);
  app.delete('/pages/:pageId', pages.remove);
};
