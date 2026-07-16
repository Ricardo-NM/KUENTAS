import * as nodemailer from "nodemailer";
import {
  defaultLanguage,
  isSupportedLanguage,
  resources,
  type SupportedLanguage,
} from "@/lib/i18n/resources";

const emailColors = {
  background: "#ffffff",
  surface: "#f7f9fb",
  border: "#e2e8f0",
  primary: "#0d0d12",
  secondary: "#64748b",
  text: "#191c1e",
  destructive: "#ba1a1a",
};

function getAccountDeletionEmailConfig() {
  const user = process.env.PASSWORD_RESET_EMAIL_USER;
  const pass = process.env.PASSWORD_RESET_EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "PASSWORD_RESET_EMAIL_USER and PASSWORD_RESET_EMAIL_APP_PASSWORD are required.",
    );
  }

  return {
    user,
    pass,
  };
}

function resolveLanguage(language: string | undefined): SupportedLanguage {
  const baseLanguage = language?.split("-")[0] ?? null;

  return isSupportedLanguage(baseLanguage) ? baseLanguage : defaultLanguage;
}

function interpolate(value: string, params: Record<string, string>) {
  return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return params[key] ?? match;
  });
}

function getAccountDeletionEmailCopy(
  language: SupportedLanguage,
  code: string,
  expiresAt: Date,
) {
  const translation = resources[language].translation;
  const copy = translation.email.accountDeletion;
  const locale = language === "es" ? "es-MX" : "en-US";
  const expirationTime = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(expiresAt);
  const params = {
    code,
    expirationTime,
    appName: translation.common.appName,
  };

  return {
    appName: translation.common.appName,
    subject: interpolate(copy.subject, params),
    title: interpolate(copy.title, params),
    intro: interpolate(copy.intro, params),
    codeLabel: interpolate(copy.codeLabel, params),
    expiration: interpolate(copy.expiration, params),
    ignore: interpolate(copy.ignore, params),
    textLines: copy.textLines.map((line) => interpolate(line, params)),
  };
}

function buildAccountDeletionEmailHtml({
  appName,
  title,
  intro,
  codeLabel,
  code,
  expiration,
  ignore,
}: {
  appName: string;
  title: string;
  intro: string;
  codeLabel: string;
  code: string;
  expiration: string;
  ignore: string;
}) {
  return `
    <div style="margin:0;background:${emailColors.background};padding:32px 16px;font-family:Inter,Arial,sans-serif;color:${emailColors.text};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 16px 0;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${emailColors.primary};">
            ${appName}
          </td>
        </tr>
        <tr>
          <td style="border:1px solid ${emailColors.border};border-radius:16px;background:${emailColors.surface};padding:28px;">
            <h1 style="margin:0 0 12px 0;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;font-size:24px;line-height:32px;font-weight:700;color:${emailColors.primary};">
              ${title}
            </h1>
            <p style="margin:0 0 20px 0;font-size:14px;line-height:22px;color:${emailColors.secondary};">
              ${intro}
            </p>
            <div style="margin:0 0 20px 0;border:1px solid ${emailColors.border};border-radius:12px;background:${emailColors.background};padding:20px;text-align:center;">
              <div style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${emailColors.secondary};">
                ${codeLabel}
              </div>
              <div style="font-family:'JetBrains Mono','SFMono-Regular',Consolas,monospace;font-size:32px;line-height:40px;font-weight:700;letter-spacing:0.16em;color:${emailColors.destructive};">
                ${code}
              </div>
            </div>
            <p style="margin:0 0 8px 0;font-size:12px;line-height:18px;color:${emailColors.secondary};">
              ${expiration}
            </p>
            <p style="margin:0;font-size:12px;line-height:18px;color:${emailColors.secondary};">
              ${ignore}
            </p>
            <div style="margin-top:20px;height:3px;width:48px;border-radius:999px;background:${emailColors.destructive};"></div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendAccountDeletionCodeEmail({
  to,
  code,
  expiresAt,
  language,
}: {
  to: string;
  code: string;
  expiresAt: Date;
  language?: string;
}) {
  const config = getAccountDeletionEmailConfig();
  const copy = getAccountDeletionEmailCopy(
    resolveLanguage(language),
    code,
    expiresAt,
  );
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: `"${copy.appName}" <${config.user}>`,
    to,
    subject: copy.subject,
    text: copy.textLines.join("\n"),
    html: buildAccountDeletionEmailHtml({
      ...copy,
      code,
    }),
  });
}
