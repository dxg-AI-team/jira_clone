// Build a Jira-style issue key like "ABC-12" from a board key and issue number.
// Falls back to "#<number-or-id>" when the board key isn't available so the UI
// never shows an empty label.
export const formatIssueKey = (boardKey, number) => {
  if (boardKey && number != null) return `${boardKey}-${number}`;
  if (number != null) return `#${number}`;
  return '';
};

// Convenience for the common case where we have the full project + issue objects.
export const issueKey = (project, issue) => {
  if (!issue) return '';
  const number = issue.number != null ? issue.number : issue.id;
  return formatIssueKey(project && project.key, number);
};
