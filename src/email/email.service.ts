import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import type { EmailDTO, PasswordResetDTO } from './email.dto.js';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly emailFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if(!apiKey) throw new Error("RESEND_API_KEY environment variable is not configured.");
    if(!emailFrom) throw new Error("EMAIL_FROM environment variable is not configured.");

     this.resend = new Resend(apiKey);
     this.emailFrom = emailFrom;
  }

  async sendAccountVerificationEmail(emailDto: EmailDTO) {
    const { email, verificationUrl } = emailDto;

    const { data, error } = await this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Verifique seu e-mail | O que Sobrou?',
      text: [
          'Olá!',
          '',
          'Obrigado por criar uma conta no O que Sobrou?',
          'Para verificar seu endereço de e-mail, acesse o link abaixo:',
          '',
          verificationUrl,
          '',
          'Se você não criou uma conta no O que Sobrou?, ignore este e-mail.',
        ].join('\n'),
        html: `
          <div>
            <h1>Bem-vindo ao O que Sobrou?</h1>
            <p>Obrigado por criar sua conta.</p>
            <p>
              Para verificar seu endereço de e-mail, clique no botão abaixo:
            </p>
            <p>
              <a href="${verificationUrl}">
                Verificar meu e-mail
              </a>
            </p>
            <p>
              Se o botão não funcionar, copie e cole este endereço no navegador:
            </p>
            <p>${verificationUrl}</p>
            <p>
              Se você não criou uma conta no O que Sobrou?, ignore este e-mail.
            </p>
          </div>
        `,
      });

    if (error) {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
    if(!data?.id) {
      throw new Error("Email provider did not return a message ID.")
    }

    return { success: true, messageId: data.id }
  }

  async sendPasswordResetEmail(passwordReset: PasswordResetDTO){
    const { email, resetUrl } = passwordReset;

    const { data, error } = await this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Recuperação de senha | O que Sobrou?',
      text: [
          'Olá!',
          '',
          'Obrigado por ter uma conta no O que Sobrou?',
          'Para recuperar sua senha, acesse o link abaixo:',
          '',
          resetUrl,
          '',
          'Se você não criou uma conta no O que Sobrou?, ignore este e-mail.',
        ].join('\n'),
        html: `
          <div>
            <h1>Bem-vindo ao O que Sobrou?</h1>
            <p>
              Para recuperar sua senha, clique no botão abaixo:
            </p>
            <p>
              <a href="${resetUrl}">
                Recuperar senha
              </a>
            </p>
            <p>
              Se o botão não funcionar, copie e cole este endereço no navegador:
            </p>
            <p>${resetUrl}</p>
            <p>
              Se você não criou uma conta no O que Sobrou?, ignore este e-mail.
            </p>
          </div>
        `,
      });

    if (error) {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
    if(!data?.id) {
      throw new Error("Email provider did not return a message ID.")
    }

    return { success: true, messageId: data.id }
  }
}

