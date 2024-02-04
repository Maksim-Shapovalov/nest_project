import nodemailer from 'nodemailer';
import { injectable } from 'inversify';
import 'reflect-metadata';
@injectable()
export class EmailAdapter {
  async sendEmail(createUser: any, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'maksim.shapovalov.01@gmail.com',
          pass: 'wewedrlwgkkmoswq',
        },
      });
      //createUser.email
      const info = {
        from: 'Maksim <maksim.shapovalov.01@gmail.com>',
        to: createUser.email,
        subject: createUser.login,
        html: message,
      };

      return transporter.sendMail(info);
      // const timeToStart = new Date()
    } catch (e) {
      console.log('error', e);
    }
  }
  async resendEmail(userEmail: string, userLogin: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'maksim.shapovalov.01@gmail.com',
          pass: 'wewedrlwgkkmoswq',
        },
      });
      //createUser.email
      const info = {
        from: 'Maksim <maksim.shapovalov.01@gmail.com>',
        to: userEmail,
        subject: userLogin,
        html: message,
      };

      return transporter.sendMail(info);
      // const timeToStart = new Date()
    } catch (e) {
      console.log('error', e);
    }
  }
  async sendEmailToCode(email: string, textForSend: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'maksim.shapovalov.01@gmail.com',
          pass: 'wewedrlwgkkmoswq',
        },
      });
      const info = {
        from: 'Maksim <maksim.shapovalov.01@gmail.com>',
        to: email,
        subject: email,
        html: textForSend,
      };
      return transporter.sendMail(info);
    } catch (e) {
      console.log('error', e);
    }
  }
}
