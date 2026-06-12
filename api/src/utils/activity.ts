import { ActivityLog } from 'entities';

// Records an issue activity entry. Best-effort: never let logging break the
// request it accompanies.
export const logActivity = async (
  issueId: number,
  userId: number | null,
  action: string,
  detail: string,
): Promise<void> => {
  try {
    await ActivityLog.create({ issueId, userId, action, detail }).save();
  } catch (error) {
    // swallow — activity logging is non-critical
  }
};
