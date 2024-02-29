import { EmailAdapter } from './email-adapter';
import { injectable } from 'inversify';
import 'reflect-metadata';
@injectable()
export class EmailManager {
  constructor(protected emailAdapter: EmailAdapter) {}
  async sendEmailRecoveryMessage(createUser: any) {
    const textForSend = `<h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${createUser.emailConfirmation.confirmationCode}'>complete registration</a>
        </p>`;
    await this.emailAdapter.sendEmail(createUser, textForSend);
  }
  async repeatSendEmailRecoveryMessage(
    userEmail: string,
    userlogin: string,
    userCode: string,
  ) {
    const textForSend = `<h1>Resend a message</h1>
        <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${userCode}'>complete registration</a>
        </p>`;
    await this.emailAdapter.resendEmail(userEmail, userlogin, textForSend);
  }
  async sendEmailWithTheCode(email: string, recoveryCode: string) {
    const textForSend = `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password = ${recoveryCode}</a>
      </p>`;
    await this.emailAdapter.sendEmailToCode(email, textForSend);
  }
}
