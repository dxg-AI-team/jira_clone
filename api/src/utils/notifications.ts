import { Notification, User } from 'entities';

interface NotificationInput {
  type: string;
  message: string;
  userId: number;
  actorId?: number | null;
  issueId?: number | null;
  projectId?: number | null;
}

// Persist one notification per recipient. Recipients equal to the actor are
// skipped (you don't get notified about your own actions). Duplicate
// recipients within a single call are collapsed.
export const notify = async (
  recipientIds: number[],
  base: Omit<NotificationInput, 'userId'> & { actorId?: number | null },
): Promise<void> => {
  const unique = Array.from(new Set(recipientIds)).filter(id => id && id !== base.actorId);
  await Promise.all(
    unique.map(userId =>
      Notification.create({ isRead: false, ...base, userId } as Partial<Notification>).save(),
    ),
  );
};

// Find members mentioned in a body via "@Name". Matching is a plain substring
// check so it works for multi-byte (Japanese) display names.
export const findMentionedUserIds = (body: string, members: User[]): number[] => {
  if (!body) return [];
  return members.filter(member => member.name && body.includes(`@${member.name}`)).map(m => m.id);
};
