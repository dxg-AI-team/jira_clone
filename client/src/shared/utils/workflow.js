// Parse a board's workflow config (stored as a JSON string on the project)
// into a map keyed by status: { [status]: { name, wipLimit } }.
// Returns an empty map when no custom workflow is configured.
export const parseWorkflow = project => {
  const map = {};
  if (project && project.workflow) {
    try {
      const config = JSON.parse(project.workflow);
      if (Array.isArray(config)) {
        config.forEach(entry => {
          if (entry && entry.status) map[entry.status] = entry;
        });
      }
    } catch (error) {
      // Malformed config — fall back to defaults.
    }
  }
  return map;
};
