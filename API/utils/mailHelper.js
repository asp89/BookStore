const nodemailer = require("nodemailer");

const mailHelper = async (option) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
  });

  const message = {
    from: process.env.PRODUCT_SUPPORT,
    to: option.recipientEmail,
    subject: option.subject,
    text: option.message
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper;
