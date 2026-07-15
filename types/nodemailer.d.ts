declare module "nodemailer" {
  type SendMailOptions = {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  };

  type TransportOptions = {
    service?: string;
    auth: {
      user: string;
      pass: string;
    };
  };

  type Transporter = {
    sendMail(options: SendMailOptions): Promise<unknown>;
  };

  export function createTransport(options: TransportOptions): Transporter;
}
