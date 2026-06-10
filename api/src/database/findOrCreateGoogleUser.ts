import { User, Project } from 'entities';
import { ProjectCategory } from 'constants/projects';
import { createEntity } from 'utils/typeorm';

export type GooglePayload = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

// The whole app shares a single project. Use the oldest existing project, or
// create a default one if the database is empty.
const getOrCreateSharedProject = async (): Promise<Project> => {
  const project = await Project.findOne({ order: { id: 'ASC' } });
  if (project) {
    return project;
  }
  return createEntity(Project, {
    name: 'サンプルプロジェクト',
    url: 'https://www.atlassian.com/software/jira',
    description: 'これは空のサンプルプロジェクトです。課題を自由に作成してください。',
    category: ProjectCategory.SOFTWARE,
  });
};

// Resolve a Google-authenticated user to a local User record:
// match by googleId, then by email (linking the account), otherwise create a
// new member of the shared project. The very first user becomes an admin.
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

  const project = await getOrCreateSharedProject();
  const adminCount = await User.count({ where: { role: 'admin' } });

  return createEntity(User, {
    name: name || email || 'User',
    email: email || '',
    avatarUrl: picture || '',
    googleId: googleId || null,
    role: adminCount === 0 ? 'admin' : 'member',
    project,
  } as Partial<User>);
};

export default findOrCreateGoogleUser;
