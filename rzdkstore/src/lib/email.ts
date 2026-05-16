import nodemailer from 'nodemailer';

/**
 * Nodemailer Email Service
 * Menggunakan SMTP dari shared hosting.
 *
 * Semua email dikirim dengan template HTML branded (tema hitam-hijau).
 */

// Singleton transporter
// secure: true  → pakai SSL (port 465)
// secure: false → pakai STARTTLS (port 587) — default Mailtrap & banyak provider
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // true jika port 465 (SSL), false jika port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ============================================================
// BASE EMAIL TEMPLATE
// ============================================================

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>rzdkstore</title>
</head>
<body style="margin:0;padding:0;background-color:#171717;font-family:'Inter',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#171717;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#2c2c2c;border-radius:12px;border:1px solid #3f3f46;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #3f3f46;">
              <span style="font-family:'Poppins',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">
                <span style="color:#01a35a;">rzdk</span>store
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #3f3f46;background-color:#1f1f1f;">
              <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
                Email ini dikirim otomatis oleh sistem rzdkstore.<br/>
                Jika ada pertanyaan, hubungi kami via
                <a href="https://wa.me/6285111642004" style="color:#01a35a;text-decoration:none;">WhatsApp</a>.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#52525b;">
                &copy; ${new Date().getFullYear()} rzdkstore.my.id — Semua hak dilindungi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================
// BUTTON COMPONENT
// ============================================================

function emailButton(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#01a35a;border-radius:8px;padding:14px 28px;">
      <a href="${url}" target="_blank" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;font-family:'Inter',Arial,sans-serif;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

interface SendVerificationEmailParams {
  to: string;
  name: string;
  verificationUrl: string;
}

/**
 * Kirim email verifikasi akun baru.
 * Berisi link token yang expired 24 jam.
 */
export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: SendVerificationEmailParams): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;font-family:'Poppins',Arial,sans-serif;font-size:22px;font-weight:600;color:#ffffff;">
      Verifikasi Email Anda
    </h2>
    <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;line-height:1.6;">
      Halo <strong style="color:#ffffff;">${name}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#a1a1aa;line-height:1.6;">
      Terima kasih telah mendaftar di rzdkstore! Klik tombol di bawah untuk memverifikasi email Anda dan mengaktifkan akun.
    </p>
    ${emailButton('Verifikasi Email Saya', verificationUrl)}
    <p style="margin:0 0 8px;font-size:12px;color:#71717a;line-height:1.5;">
      Atau salin link berikut ke browser Anda:
    </p>
    <p style="margin:0 0 16px;font-size:12px;color:#01a35a;word-break:break-all;">
      ${verificationUrl}
    </p>
    <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
      ⏰ Link ini akan expired dalam <strong style="color:#f59e0b;">24 jam</strong>.<br/>
      Jika Anda tidak merasa mendaftar, abaikan email ini.
    </p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'rzdkstore <noreply@rzdkstore.my.id>',
    to,
    subject: 'Verifikasi Email — rzdkstore',
    html: baseTemplate(content),
  });
}

interface SendResetPasswordEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

/**
 * Kirim email reset password.
 * Berisi link token yang expired 1 jam.
 */
export async function sendResetPasswordEmail({
  to,
  name,
  resetUrl,
}: SendResetPasswordEmailParams): Promise<void> {
  const content = `
    <h2 style="margin:0 0 16px;font-family:'Poppins',Arial,sans-serif;font-size:22px;font-weight:600;color:#ffffff;">
      Reset Password
    </h2>
    <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;line-height:1.6;">
      Halo <strong style="color:#ffffff;">${name}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#a1a1aa;line-height:1.6;">
      Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru.
    </p>
    ${emailButton('Reset Password Saya', resetUrl)}
    <p style="margin:0 0 8px;font-size:12px;color:#71717a;line-height:1.5;">
      Atau salin link berikut ke browser Anda:
    </p>
    <p style="margin:0 0 16px;font-size:12px;color:#01a35a;word-break:break-all;">
      ${resetUrl}
    </p>
    <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
      ⏰ Link ini akan expired dalam <strong style="color:#f59e0b;">1 jam</strong>.<br/>
      Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tetap aman.
    </p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'rzdkstore <noreply@rzdkstore.my.id>',
    to,
    subject: 'Reset Password — rzdkstore',
    html: baseTemplate(content),
  });
}

interface SendNotificationEmailParams {
  to: string;
  name: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Kirim email notifikasi generik (order update, garansi, announcement).
 * Digunakan sebagai fallback jika push notification gagal.
 */
export async function sendNotificationEmail({
  to,
  name,
  title,
  message,
  actionUrl,
  actionText,
}: SendNotificationEmailParams): Promise<void> {
  const buttonHtml = actionUrl && actionText ? emailButton(actionText, actionUrl) : '';

  const content = `
    <h2 style="margin:0 0 16px;font-family:'Poppins',Arial,sans-serif;font-size:22px;font-weight:600;color:#ffffff;">
      ${title}
    </h2>
    <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;line-height:1.6;">
      Halo <strong style="color:#ffffff;">${name}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#a1a1aa;line-height:1.6;">
      ${message}
    </p>
    ${buttonHtml}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'rzdkstore <noreply@rzdkstore.my.id>',
    to,
    subject: `${title} — rzdkstore`,
    html: baseTemplate(content),
  });
}
