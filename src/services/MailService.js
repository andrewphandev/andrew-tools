import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import { EMAIL_USER, EMAIL_PASSWORD } from '../configs/index';
import logger from '../utils/logger';

module.exports.sendMail = async (email, subject, message, cc = []) => {
  try {
    const transporter = nodemailer.createTransport(
      smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      }),
    );

    await transporter.sendMail(
      {
        from: 'Systembed Controller',
        to: email,
        cc,
        subject,
        html: message,
      },
      (err, info) => {
        if (err) {
          logger.error(err.message);
        } else {
          logger.info(`Email sent: ${info.response}`);
        }
      },
    );
  } catch (err) {
    logger.error(err.message);
  }
};
