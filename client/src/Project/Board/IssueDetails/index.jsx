import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import api from 'shared/utils/api';
import useApi from 'shared/hooks/api';
import { PageError, CopyLinkButton, Button, AboutTooltip } from 'shared/components';

import Loader from './Loader';
import Type from './Type';
import Delete from './Delete';
import Title from './Title';
import Description from './Description';
import Comments from './Comments';
import Status from './Status';
import AssigneesReporter from './AssigneesReporter';
import Priority from './Priority';
import Version from './Version';
import Components from './Components';
import Attributes from './Attributes';
import EstimateTracking from './EstimateTracking';
import Dates from './Dates';
import Watchers from './Watchers';
import IssueLinks from './IssueLinks';
import Attachments from './Attachments';
import Activity from './Activity';
import { TopActions, TopActionsRight, Content, Left, Right } from './Styles';

const propTypes = {
  issueId: PropTypes.string.isRequired,
  projectUsers: PropTypes.array.isRequired,
  projectVersions: PropTypes.array.isRequired,
  projectComponents: PropTypes.array.isRequired,
  projectIssues: PropTypes.array.isRequired,
  fetchProject: PropTypes.func.isRequired,
  updateLocalProjectIssues: PropTypes.func.isRequired,
  modalClose: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetails = ({
  issueId,
  projectUsers,
  projectVersions,
  projectComponents,
  projectIssues,
  fetchProject,
  updateLocalProjectIssues,
  modalClose,
}) => {
  const [{ data, error, setLocalData }, fetchIssue] = useApi.get(`/issues/${issueId}`);

  if (!data) return <Loader />;
  if (error) return <PageError />;

  const { issue } = data;

  const updateLocalIssueDetails = fields =>
    setLocalData(currentData => ({ issue: { ...currentData.issue, ...fields } }));

  const updateLocalIssueWatchers = watcherIds =>
    setLocalData(currentData => ({ issue: { ...currentData.issue, watcherIds } }));

  const updateIssue = updatedFields => {
    api.optimisticUpdate(`/issues/${issueId}`, {
      updatedFields,
      currentFields: issue,
      setLocalData: fields => {
        updateLocalIssueDetails(fields);
        updateLocalProjectIssues(issue.id, fields);
      },
    });
  };

  return (
    <Fragment>
      <TopActions>
        <Type issue={issue} updateIssue={updateIssue} />
        <TopActionsRight>
          <AboutTooltip
            renderLink={linkProps => (
              <Button icon="feedback" variant="empty" {...linkProps}>
                フィードバックを送る
              </Button>
            )}
          />
          <CopyLinkButton variant="empty" />
          <Delete issue={issue} fetchProject={fetchProject} modalClose={modalClose} />
          <Button icon="close" iconSize={24} variant="empty" onClick={modalClose} />
        </TopActionsRight>
      </TopActions>
      <Content>
        <Left>
          <Title issue={issue} updateIssue={updateIssue} />
          <Description issue={issue} updateIssue={updateIssue} />
          <Attachments issue={issue} fetchIssue={fetchIssue} />
          <Comments issue={issue} fetchIssue={fetchIssue} />
          <Activity issue={issue} />
        </Left>
        <Right>
          <Status issue={issue} updateIssue={updateIssue} />
          <AssigneesReporter issue={issue} updateIssue={updateIssue} projectUsers={projectUsers} />
          <Watchers issue={issue} updateLocalIssueWatchers={updateLocalIssueWatchers} />
          <Priority issue={issue} updateIssue={updateIssue} />
          <Version issue={issue} updateIssue={updateIssue} projectVersions={projectVersions} />
          <Components
            issue={issue}
            updateIssue={updateIssue}
            projectComponents={projectComponents}
          />
          <Attributes issue={issue} updateIssue={updateIssue} projectIssues={projectIssues} />
          <IssueLinks issue={issue} projectIssues={projectIssues} fetchIssue={fetchIssue} />
          <EstimateTracking issue={issue} updateIssue={updateIssue} />
          <Dates issue={issue} />
        </Right>
      </Content>
    </Fragment>
  );
};

ProjectBoardIssueDetails.propTypes = propTypes;

export default ProjectBoardIssueDetails;
