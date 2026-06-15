import { OAuth2Client } from 'google-auth-library';

import { catchErrors, BadUserInputError, CustomError } from 'errors';
import { signToken } from 'utils/authToken';
import { User } from 'entities';
import createAccount from 'database/createGuestAccount';
import findOrCreateGoogleUser from 'database/findOrCreateGoogleUser';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const createGuestAccount = catchErrors(async (_req, res) => {
  // Reuse an existing guest account instead of seeding a fresh "singularity 1.0"
  // project on every visit. Only seed when the database is empty AND seeding is
  // enabled. Set SEED_GUEST_DATA=false to never seed (keeps the database empty).
  let user = await User.findOne({ order: { id: 'ASC' } });

  if (!user && process.env.SEED_GUEST_DATA !== 'false') {
    user = await createAccount();
  }

  res.respond({
    authToken: user ? signToken({ sub: user.id }) : null,
  });
});

export const googleLogin = catchErrors(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    throw new BadUserInputError({ fields: { credential: 'Google credential is required.' } });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new CustomError('Google ログインが未設定です。', 'GOOGLE_NOT_CONFIGURED', 503);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new CustomError('Google 認証に失敗しました。', 'GOOGLE_AUTH_FAILED', 401);
  }
  if (!payload || !payload.email) {
    throw new CustomError(
      'Google アカウントの情報を取得できませんでした。',
      'GOOGLE_AUTH_FAILED',
      401,
    );
  }

  const user = await findOrCreateGoogleUser({
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });

  // Allowlist model: only pre-registered (admin-invited) accounts may sign in.
  if (!user) {
    throw new CustomError(
      'このアプリへのアクセス権がありません。管理者にメンバー追加を依頼してください。',
      'ACCESS_NOT_ALLOWED',
      403,
    );
  }

  res.respond({
    authToken: signToken({ sub: user.id }),
  });
});
