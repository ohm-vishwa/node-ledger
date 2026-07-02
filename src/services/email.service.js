const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegisterationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for registering at <strong>Backend Ledger</strong>. We're excited to have you on board!</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toaccount) {
  const subject = "Transaction Confirmation - Backend Ledger";
  const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toaccount} was successful.\n\nThank you for using Backend Ledger!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your transaction of <strong>$${amount}</strong> to account <strong>${toaccount}</strong> was successful.</p>
    <p>Thank you for using <strong>Backend Ledger</strong>!</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(
  userEmail,
  name,
  amount,
  toaccount,
  reason,
) {
  const subject = "Transaction Failed - Backend Ledger";
  const text = `Hello ${name},\n\nWe were unable to process your transaction of $${amount} to account ${toaccount}.\nReason: ${reason}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>We were unable to process your transaction of <strong>$${amount}</strong> to account <strong>${toaccount}</strong>.</p>
    <p><strong>Reason for failure:</strong> ${reason}</p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegisterationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
