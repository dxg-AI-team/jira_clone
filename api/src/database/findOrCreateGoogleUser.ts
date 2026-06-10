import { User } from 'entities';
import { createEntity } from 'utils/typeorm';

export type GooglePayload = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

// Resolve a Google-authenticated user to a global User record: match by googleId,
// then by email (linking the account), otherwise create a new global user. The very
// first user becomes an admin. Project membership is managed separately.
const findOrCreateGoogleUser = async (payload: GooglePayload): Promise<User> => {
  const { sub: googleId, email, name, picture } = payload;

  let user: User | undefined;
  if (googleId) {
    user = await User.findOne({ where: { googleId } });
  }
  if (!user && email) {
    user = await User.findOne({ where: { email } });
  }

  if (user) {
    let changed = false;
    if (!user.googleId && googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.avatarUrl && picture) {
      user.avatarUrl = picture;
      changed = true;
    }
    if (changed) {
      await user.save();
    }
    return user;
  }

  const adminCount = await User.count({ where: { role: 'admin' } });

  return createEntity(User, {
    name: name || email || 'User',
    email: email || '',
    avatarUrl: picture || '',
    googleId: googleId || null,
    role: adminCount === 0 ? 'admin' : 'member',
  } as Partial<User>);
};

export default findOrCreateGoogleUser;
