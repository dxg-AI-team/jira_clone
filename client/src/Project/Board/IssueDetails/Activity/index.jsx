import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Avatar } from 'shared/components';

import { SectionTitle } from '../Styles';
import { List, Row, Body, Line, Actor, Time, Empty } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
};

const Activity = ({ issue }) => {
  const activity = issue.activity || [];

  return (
    <Fragment>
      <SectionTitle>アクティビティ</SectionTitle>
      {activity.length === 0 ? (
        <Empty>まだアクティビティはありません。</Empty>
      ) : (
        <List>
          {activity.map(item => (
            <Row key={item.id}>
              <Avatar
                size={28}
                name={item.user ? item.user.name : '?'}
                avatarUrl={item.user && item.user.avatarUrl}
              />
              <Body>
                <Line>
                  <Actor>{item.user ? item.user.name : '不明なユーザー'}</Actor> さんが
                  {item.detail}
                </Line>
                <Time>{moment(item.createdAt).fromNow()}</Time>
              </Body>
            </Row>
          ))}
        </List>
      )}
    </Fragment>
  );
};

Activity.propTypes = propTypes;

export default Activity;
