/**
 * Email utility -- uses Nodemailer with Ethereal test accounts.
 * In development, all emails are captured at a preview URL logged to the console.
 */
const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Create an Ethereal test account on first call
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('[Email] Ethereal test account ready');
  console.log(`[Email] User: ${testAccount.user}`);
  return transporter;
}

/**
 * Send login credentials to a newly registered voter.
 */
async function sendCredentialsEmail(toEmail, name, password) {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: '"EMS Admin" <admin@ems.local>',
    to: toEmail,
    subject: 'Your EMS Voter Account',
    text: [
      `Hello ${name},`,
      '',
      'An account has been created for you on the Election Management System.',
      '',
      `Email:    ${toEmail}`,
      `Password: ${password}`,
      '',
      'Please log in at the EMS portal to participate in elections.',
      '',
      '-- EMS System',
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #161822; color: #eae8e3; border-radius: 12px;">
        <h2 style="color: #e8a838; margin-bottom: 24px;">Your EMS Account</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>An account has been created for you on the Election Management System.</p>
        <table style="margin: 20px 0; border-collapse: collapse;">
          <tr><td style="padding: 8px 16px 8px 0; color: #8b8a95;">Email</td><td style="padding: 8px 0;"><strong>${toEmail}</strong></td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #8b8a95;">Password</td><td style="padding: 8px 0;"><strong>${password}</strong></td></tr>
        </table>
        <p style="color: #8b8a95; font-size: 13px;">Please log in at the EMS portal to participate in elections.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[Email] Credentials sent to ${toEmail} -> Preview: ${previewUrl}`);
  return previewUrl;
}

/**
 * Send a one-time voting OTP.
 */
async function sendOtpEmail(toEmail, otp) {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: '"EMS Voting" <voting@ems.local>',
    to: toEmail,
    subject: `Your Voting OTP: ${otp}`,
    text: `Your one-time voting code is: ${otp}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #161822; color: #eae8e3; border-radius: 12px; text-align: center;">
        <h2 style="color: #e8a838; margin-bottom: 16px;">Voting Verification</h2>
        <p style="color: #8b8a95;">Your one-time voting code is:</p>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #e8a838; margin: 24px 0; padding: 16px; background: #0f1117; border-radius: 8px;">${otp}</div>
        <p style="color: #8b8a95; font-size: 13px;">This code expires in 10 minutes.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[Email] OTP sent to ${toEmail} -> Preview: ${previewUrl}`);
  return previewUrl;
}

/**
 * Send vote receipt confirmation.
 */
async function sendReceiptEmail(toEmail, receipt) {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: '"EMS Voting" <voting@ems.local>',
    to: toEmail,
    subject: `Vote Receipt: ${receipt.receipt_code}`,
    text: `Your vote has been recorded.\n\nReceipt Code: ${receipt.receipt_code}\nElection: ${receipt.election_title}\nPosition: ${receipt.position_name}\nCandidate: ${receipt.candidate_name}\nTimestamp: ${receipt.created_at}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #161822; color: #eae8e3; border-radius: 12px;">
        <h2 style="color: #3ecf8e; margin-bottom: 24px;">Vote Recorded</h2>
        <table style="margin: 20px 0; border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px 16px 8px 0; color: #8b8a95;">Receipt</td><td style="padding: 8px 0;"><strong>${receipt.receipt_code}</strong></td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #8b8a95;">Election</td><td style="padding: 8px 0;">${receipt.election_title}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #8b8a95;">Position</td><td style="padding: 8px 0;">${receipt.position_name}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #8b8a95;">Candidate</td><td style="padding: 8px 0;">${receipt.candidate_name}</td></tr>
        </table>
        <p style="color: #8b8a95; font-size: 13px;">Keep this receipt code for your records.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[Email] Receipt sent to ${toEmail} -> Preview: ${previewUrl}`);
  return previewUrl;
}

module.exports = { sendCredentialsEmail, sendOtpEmail, sendReceiptEmail };
