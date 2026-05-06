import * as request from 'request';
import * as nodemailer from 'nodemailer';

export interface MailModel {
    from?: string;
    to: string;
    cc?: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<any>;
}

export interface MailProvider {
    send(mail: MailModel): Promise<request.RequestResponse>;
    sendMultiple(mail: MailModel[]): Promise<request.RequestResponse[]>;
}

export class GmailProvider implements MailProvider {
    private transporter: nodemailer.Transporter;
    private opts: any;
    constructor(opts: any) {
        this.opts = opts;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.opts.userName,
                pass: this.opts.password
            }
        });
    }
    public send(mailOption: MailModel): Promise<request.RequestResponse> {
        return new Promise<nodemailer.SentMessageInfo>((resolver, reject) => {
            this.transporter.sendMail(mailOption, (error: Error, info: nodemailer.SentMessageInfo) => {
                error ? reject(error) : resolver(info);
            });
        });
    }
    public sendMultiple(mails: MailModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(mails.map(mail => (async (msg) => this.send(msg))(mail)));
    }
}
export class MailFactory {
    public static GetMailProvider(provider: string, opts: Object) {
        let res: MailProvider;
        switch (provider) {
            case 'gmail':
                res = new GmailProvider(opts);
                break;
            default:
                break;
        }
        return res;
    }
}
