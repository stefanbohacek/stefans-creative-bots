import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (emailOptions) => {
  try {
    console.log("sending email...", emailOptions);
    const info = await transporter.sendMail(emailOptions);
  } catch (error) {
    console.error("error sending email:", error);
  }
};

export const notifyAdmin = async (subject, body) => {
  await sendEmail({
    from: process.env.SMTP_EMAIL,
    to: process.env.ADMIN_EMAIL_ADDRESS,
    subject: `Stefan's Creative Bots: ${subject || "Admin notification"}`,
    html: /* html */`${body || ""}`,
  });
};
