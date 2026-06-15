import { User } from 'entities';
import { createEntity } from 'utils/typeorm';

export type GooglePayload = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

// Resolve a Google-authenticated user to a global User record (allowlist model):
// match by googleId, then by email (linking the account). A user is only allowed
// in if they already exist — i.e. an admin pre-added them by email — OR the
// database is completely empty (first-run bootstrap: that first user becomes the
// admin). Otherwise this returns null and the caller denies access.
const findOrCreateGoogleUser = async (payload: GooglePayload): Promise<User | null> => {
  const { sub: googleId, email, name, picture } = payload;

  let user: User | undefined;
  if (googleId) {
    user = await User.findOne({ where: { googleId } });
  }
  if (!user && email) {
    // Case-insensitive match so an admin-invited email links regardless of case.
    user = await User.createQueryBuilder('u')
      .where('LOWER(u.email) = LOWER(:email)', { email })
      .getOne();
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
    // Invited users are created with their email as a placeholder name; replace
    // it with the real Google display name on first sign-in.
    if (name && (!user.name || user.name === user.email)) {
      user.name = name;
      changed = true;
    }
    if (changed) {
      await user.save();
    }
    return user;
  }

  // Not pre-registered. Only allow creating an account when the DB is empty
  // (bootstraps the very first admin on a fresh deployment).
  const userCount = await User.count();
  if (userCount > 0) {
    return null;
  }

  return createEntity(User, {
    name: name || email || 'User',
    email: email || '',
    avatarUrl: picture || '',
    googleId: googleId || null,
    role: 'admin',
  } as Partial<User>);
};

export default findOrCreateGoogleUser;
