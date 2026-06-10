// Holds the id of the project the user is currently viewing. It is set from the
// URL (/project/:projectId) and sent to the API as the `X-Project-Id` header so
// every project-scoped request is resolved to the right project.
let currentProjectId = null;

export const setCurrentProjectId = id => {
  currentProjectId = id ? Number(id) : null;
};

export const getCurrentProjectId = () => currentProjectId;
