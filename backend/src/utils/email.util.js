const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function fmt(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// Wraps content in a consistent, desktop-safe email shell
function shell(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MarketMinds</title></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#0d0d0d;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#C9A227;font-family:Georgia,serif;">MarketMinds</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 32px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px 32px;border-top:1px solid #222;">
              <p style="margin:0;font-size:11px;color:#444;">This email was sent by MarketMinds. If you did not expect this, please ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendOTPEmail(to, name, otp) {
  const minutes = process.env.OTP_EXPIRES_MINUTES || "10";
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your MarketMinds Verification OTP",
    html: shell(`
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 20px;">Email Verification</p>
      <p style="font-size:15px;color:#fff;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:13px;color:#aaa;margin:0 0 24px;">Use the OTP below to verify your account. It expires in <strong style="color:#fff;">${minutes} minutes</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;">
            <span style="font-size:38px;font-weight:700;letter-spacing:14px;color:#C9A227;">${otp}</span>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#555;margin:20px 0 0;">If you did not request this, please ignore this email.</p>
    `),
  });
}

async function sendKYCApprovedEmail(to, name) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "KYC Approved — MarketMinds",
    html: shell(`
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 20px;">KYC Verification</p>
      <p style="font-size:15px;color:#fff;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:13px;color:#aaa;margin:0 0 16px;">Your KYC has been <strong style="color:#C9A227;">approved</strong>. You can now purchase investment plans.</p>
      <p style="font-size:13px;color:#aaa;margin:0;">Thank you for choosing MarketMinds.</p>
    `),
  });
}

async function sendKYCRejectedEmail(to, name, reason) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "KYC Update — MarketMinds",
    html: shell(`
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 20px;">KYC Verification</p>
      <p style="font-size:15px;color:#fff;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:13px;color:#aaa;margin:0 0 16px;">Your KYC was not approved.</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:14px 18px;">
            <p style="font-size:13px;color:#aaa;margin:0;"><strong style="color:#fff;">Reason:</strong> ${reason || "No reason provided"}</p>
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#aaa;margin:0;">Please update your bank details and resubmit your KYC application.</p>
    `),
  });
}

async function sendPurchaseApprovedEmail(to, name, planName, amount) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Payment Confirmed — MarketMinds",
    html: shell(`
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 20px;">Payment Confirmed</p>
      <p style="font-size:15px;color:#fff;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:13px;color:#aaa;margin:0 0 20px;">
        Your payment of <strong style="color:#C9A227;">${fmt(amount)}</strong> for <strong style="color:#fff;">${planName}</strong> has been confirmed and is now active.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px;color:#666;padding-bottom:4px;">Plan</td>
                <td align="right" style="font-size:12px;color:#fff;font-weight:700;">${planName}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#666;">Amount Invested</td>
                <td align="right" style="font-size:14px;color:#C9A227;font-weight:700;">${fmt(amount)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#aaa;margin:0;">Log in to your dashboard to track your investment performance.</p>
    `),
  });
}

async function sendPurchaseRejectedEmail(to, name, planName, amount, reason) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Payment Not Confirmed — MarketMinds",
    html: shell(`
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 20px;">Payment Update</p>
      <p style="font-size:15px;color:#fff;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:13px;color:#aaa;margin:0 0 16px;">
        Unfortunately, your payment of <strong style="color:#fff;">${fmt(amount)}</strong> for <strong style="color:#fff;">${planName}</strong> could not be confirmed.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:14px 18px;">
            <p style="font-size:13px;color:#aaa;margin:0;"><strong style="color:#fff;">Reason:</strong> ${reason || "No reason provided"}</p>
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#aaa;margin:0;">Please review the details and submit a new purchase request. If you believe this is an error, contact our support team with your payment reference.</p>
    `),
  });
}

async function sendProfitCreditedEmail(to, name, amount, note) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Profit Credited — MarketMinds",
    html: shell(`
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#666;margin:0 0 20px;">Profit Credited</p>
      <p style="font-size:15px;color:#fff;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size:13px;color:#aaa;margin:0 0 20px;">
        Great news! A profit has been credited to your account.
        ${note ? `<br><span style="color:#888;">${note}</span>` : ""}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #C9A227;border-radius:12px;padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:14px;color:#fff;font-weight:700;">Amount Credited</td>
                <td align="right" style="font-size:24px;color:#C9A227;font-weight:700;">${fmt(amount)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#aaa;margin:0;">Log in to your dashboard to view your updated balance.</p>
    `),
  });
}

module.exports = {
  sendOTPEmail,
  sendKYCApprovedEmail,
  sendKYCRejectedEmail,
  sendPurchaseApprovedEmail,
  sendPurchaseRejectedEmail,
  sendProfitCreditedEmail,
};
