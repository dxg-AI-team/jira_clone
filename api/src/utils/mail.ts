import nodemailer from 'nodemailer';

// SMTP is configured via env vars. If they're absent, email sending is a no-op
// (member invites still work, just without an email notification).
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL } = process.env;

const transporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : null;

export const isMailConfigured = (): boolean => !!transporter;

// Send a space-invitation email. Best-effort: returns true on success, false if
// SMTP isn't configured or sending failed (never throws).
export const sendInviteEmail = async (
  to: string,
  spaceName: string,
  inviterName: string,
): Promise<boolean> => {
  if (!transporter || !to) return false;

  const appUrl = APP_URL || '';
  const subject = `「${spaceName}」に招待されました`;
  const text =
    `${inviterName} さんがあなたを「${spaceName}」に追加しました。\n\n` +
    `以下のURLから Google アカウントでログインしてください:\n${appUrl}\n`;
  const html =
    `<p>${inviterName} さんがあなたを「<b>${spaceName}</b>」に追加しました。</p>` +
    `<p>以下のリンクから Google アカウントでログインしてください:</p>` +
    `<p><a href="${appUrl}">${appUrl}</a></p>`;

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Failed to send invite email:', error);
    return false;
  }
};
