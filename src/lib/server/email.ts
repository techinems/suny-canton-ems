import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

let transporter: nodemailer.Transporter | null = null;

function ensureTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST) {
    throw new Error("SMTP_HOST is not configured");
  }

  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
  const secure = SMTP_SECURE === "true" || port === 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: SMTP_USER && SMTP_PASSWORD ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

export function isEmailConfigured(): boolean {
  const { SMTP_HOST } = process.env;
  return Boolean(SMTP_HOST);
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const activeTransporter = ensureTransporter();

  const from =
    options.from ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "no-reply@example.com";

  await activeTransporter.sendMail({ ...options, from });
}

export async function sendResetPasswordEmail(to: string, token: string, url: string): Promise<void> {
  const text = [
    "You requested to reset your SUNY Canton EMS password.",
    "",
    `Reset code: ${token}`,
    "",
    "You can either paste this code into the reset form or click the link below:",
    url,
    "",
    "If you did not request this reset, you can ignore this message.",
  ].join("\n");

  const html = `
    <p>You requested to reset your SUNY Canton EMS password.</p>
    <p><strong>Reset code:</strong> ${token}</p>
    <p>You can either paste this code into the reset form or click the link below:</p>
    <p><a href="${url}">${url}</a></p>
    <p>If you did not request this reset, you can ignore this message.</p>
  `;

  await sendEmail({
    to,
    subject: "Reset your SUNY Canton EMS password",
    text,
    html,
  });
}
