import { getConnection } from 'typeorm';

import { Notification } from 'entities';
import { catchErrors } from 'errors';
import { updateEntity, findEntityOrThrow } from 'utils/typeorm';

// Notifications span every board the user belongs to, so they are scoped to
// the current user rather than the X-Project-Id board.
export const getMyNotifications = catchErrors(async (req, res) => {
  const notifications = await Notification.find({
    where: { userId: req.currentUser.id },
    order: { createdAt: 'DESC' },
    take: 50,
  });
  const unreadCount = await Notification.count({
    where: { userId: req.currentUser.id, isRead: false },
  });
  res.respond({ notifications, unreadCount });
});

export const markRead = catchErrors(async (req, res) => {
  const notification = await findEntityOrThrow(Notification, req.params.notificationId);
  if (notification.userId !== req.currentUser.id) {
    res.respond({ notification });
    return;
  }
  const updated = await updateEntity(Notification, req.params.notificationId, { isRead: true });
  res.respond({ notification: updated });
});

export const markAllRead = catchErrors(async (req, res) => {
  await getConnection().query(
    'UPDATE notification SET "isRead" = true WHERE "userId" = $1 AND "isRead" = false',
    [req.currentUser.id],
  );
  res.respond({ success: true });
});
