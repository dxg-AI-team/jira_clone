import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useCurrentUser from 'shared/hooks/currentUser';
import { Button } from 'shared/components';

import { SectionTitle } from '../Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateLocalIssueWatchers: PropTypes.func.isRequired,
};

const Watchers = ({ issue, updateLocalIssueWatchers }) => {
  const { currentUser } = useCurrentUser();
  const [isWorking, setWorking] = useState(false);

  const watcherIds = issue.watcherIds || [];
  const isWatching = !!currentUser && watcherIds.includes(currentUser.id);

  const toggle = async () => {
    if (!currentUser) return;
    setWorking(true);
    try {
      const res = isWatching
        ? await api.delete(`/issues/${issue.id}/watchers/${currentUser.id}`)
        : await api.post(`/issues/${issue.id}/watchers`);
      updateLocalIssueWatchers(res.watcherIds);
    } catch (error) {
      toast.error(error);
    }
    setWorking(false);
  };

  return (
    <Fragment>
      <SectionTitle>ウォッチャー</SectionTitle>
      <Button variant="secondary" icon="feedback" isWorking={isWorking} onClick={toggle}>
        {isWatching ? `ウォッチ中（${watcherIds.length}）` : `ウォッチする（${watcherIds.length}）`}
      </Button>
    </Fragment>
  );
};

Watchers.propTypes = propTypes;

export default Watchers;
