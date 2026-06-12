import React, { Fragment, useState, useRef, useEffect, useCallback } from 'react';
import moment from 'moment';

import history from 'browserHistory';
import api from 'shared/utils/api';
import useOnOutsideClick from 'shared/hooks/onOutsideClick';
import { Icon } from 'shared/components';

import { Item, ItemText } from '../Styles';
import {
  Badge,
  Panel,
  PanelHeader,
  MarkAll,
  List,
  NotifRow,
  Dot,
  NotifBody,
  NotifText,
  NotifTime,
  Empty,
} from './Styles';

const POLL_MS = 30000;

const Notifications = () => {
  const [isOpen, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const panelRef = useRef();
  useOnOutsideClick(panelRef, isOpen, () => setOpen(false));

  const load = useCallback(async () => {
    try {
      const { notifications: rows, unreadCount: count } = await api.get('/notifications');
      setNotifications(rows);
      setUnreadCount(count);
    } catch (error) {
      // Silent: the bell shouldn't disrupt the app if a poll fails.
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    // Refresh immediately when the user returns to the tab, so the unread
    // count is up to date without waiting for the next poll.
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', load);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', load);
    };
  }, [load]);

  const handleOpen = () => {
    setOpen(!isOpen);
    if (!isOpen) load();
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      // ignore
    }
  };

  const handleClick = async notification => {
    setOpen(false);
    if (!notification.isRead) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        setUnreadCount(count => Math.max(0, count - 1));
      } catch (error) {
        // ignore
      }
    }
    if (notification.projectId && notification.issueId) {
      history.push(`/project/${notification.projectId}/board/issues/${notification.issueId}`);
    }
  };

  return (
    <Fragment>
      <Item onClick={handleOpen}>
        <Icon type="feedback" size={22} top={1} left={3} />
        <ItemText>通知</ItemText>
        {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </Item>

      {isOpen && (
        <Panel ref={panelRef}>
          <PanelHeader>
            通知
            {notifications.some(n => !n.isRead) && (
              <MarkAll onClick={markAllRead}>すべて既読にする</MarkAll>
            )}
          </PanelHeader>
          <List>
            {notifications.length === 0 ? (
              <Empty>通知はありません。</Empty>
            ) : (
              notifications.map(notification => (
                <NotifRow
                  key={notification.id}
                  unread={!notification.isRead}
                  onClick={() => handleClick(notification)}
                >
                  <Dot unread={!notification.isRead} />
                  <NotifBody>
                    <NotifText>{notification.message}</NotifText>
                    <NotifTime>{moment(notification.createdAt).fromNow()}</NotifTime>
                  </NotifBody>
                </NotifRow>
              ))
            )}
          </List>
        </Panel>
      )}
    </Fragment>
  );
};

export default Notifications;
