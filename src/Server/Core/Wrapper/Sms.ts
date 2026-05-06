import * as request from 'request';

export const SmsType = {
    plain: 0,
    flash: 1,
    unicode: 2
} as const;
export type SmsType = (typeof SmsType)[keyof typeof SmsType];

export interface SmsModel {
    numbers: string[];
    message: string;
}

export interface SolluSmsModel extends SmsModel {
    senderId: string;
    entityId: string;
    templateId: string;
}

export interface NsiteSmsModel extends SmsModel {
    SenderId: string;
    ApiKey: string;
    ClientId: string;
}

export interface VScanSmsModel extends SmsModel {
    'sender-id': string;
    'api-key': string;
    templateId: string;
}

export interface CauverySmsModel extends SmsModel {
    SenderId: string;
    ApiKey: string;
    templateId: string;
    pe_id?: string;
}

export interface IntegraSmsModel extends SmsModel {
    id: string;
    type: SmsType;
    isScheduled: number;
    dateTime: Date;
}

export interface HosmatSmsModel extends SmsModel {
    senderId: string;
    entityId: string;
    templateId: string;
}

export interface JssSmsModel extends SmsModel {
    templateId: string;
}

export interface ShuvadharshiniSmsModel extends SmsModel {
    templateId: string;
}

export interface SmsProvider {
    validate(sms: SmsModel): boolean;
    getParams(sms: SmsModel): any;
    send(sms: SmsModel): Promise<request.RequestResponse>;
    sendMultiple(sms: SmsModel[]): Promise<request.RequestResponse[]>;
}

export class SmsIntegraProvider implements SmsProvider {
    public get url() {
        return 'http://www.smsintegra.com/api/smsapi.aspx';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: IntegraSmsModel): any {
        return {
            uid: this.userName,
            pwd: this.password,
            mobile: sms.numbers && sms.numbers.join(),
            msg: sms.message,
            sid: sms.id,
            type: sms.type,
            sched: sms.isScheduled,
            dt: '',
            time: '',
            dtTimeNow: Date.now()
        };
    }
    validate(sms: IntegraSmsModel): boolean {
        return true;
    }
    public send(sms: IntegraSmsModel): Promise<request.RequestResponse> {
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { qs: this.getParams(sms) }, (error: any, response: request.RequestResponse, body: any) => {
                if (error) {
                    console.log(error);
                }
                resolve(response);
            });
        });
    }
    public sendMultiple(sms: IntegraSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export interface CannySmsModel extends SmsModel {
    senderId: string;
}

export class SmsCannyInfoProvider implements SmsProvider {
    public get url() {
        return 'http://cannyinfotech.in/api/mt/SendSMS?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: CannySmsModel) {
        return {
            user: this.userName,
            password: this.password,
            number: '91' + (sms.numbers && sms.numbers.join()),
            text: sms.message,
            channel: 'TRANS',
            DCS: 0,
            flashsms: 0,
            senderid: sms.senderId,
            route: 2
        };
    }
    validate(sms: CannySmsModel): boolean {
        return true;
    }
    public async send(sms: CannySmsModel): Promise<request.RequestResponse> {
        sms.senderId = SmsConfig['SENDER_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: CannySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export interface BoneCommSmsModel extends SmsModel {
    senderId: string;
}

export class SmsBoneInfoProvider implements SmsProvider {
    public get url() {
        return 'http://boancomm.net/boansms/boansmsinterface.aspx?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: BoneCommSmsModel) {
        return {
            mobileno: '91' + (sms.numbers && sms.numbers.join()),
            smsmsg: sms.message,
            uname: this.userName,
            pwd: this.password,
            pid: 228
        };
    }
    validate(sms: BoneCommSmsModel): boolean {
        return true;
    }
    public async send(sms: BoneCommSmsModel): Promise<request.RequestResponse> {
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: CannySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export interface InWaySmsModel extends SmsModel {
    senderId: string;
}

export class SmsInWayProvider implements SmsProvider {
    public get url() {
        return 'http://hapi.smsapi.org/SendSMS.aspx?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: InWaySmsModel) {
        return {
            UserName: this.userName,
            password: this.password,
            MobileNo: '91' + (sms.numbers && sms.numbers.join()),
            SenderID: sms.senderId,
            CDMAHeader: sms.senderId,
            Message: sms.message
        };
    }
    validate(sms: InWaySmsModel): boolean {
        return true;
    }
    public async send(sms: InWaySmsModel): Promise<request.RequestResponse> {
        sms.senderId = SmsConfig['SENDER_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: CannySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export interface SmsHorizonProviderModel extends SmsModel {
    senderId: string;
}


export class SmsHorizonProvider implements SmsProvider {
    public get url() {
        return 'http://smshorizon.co.in/api/sendsms.php?';
        //http://smshorizon.co.in/api/sendsms.php?user=lotushospitalerd369
        //&apikey=xlCB7ntnBIzAR3imTbjT&mobile=919600118985
        //&message=TestMsg&senderid=LotusH&type=txt
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: SmsHorizonProviderModel) {
        return {
            user: this.userName,
            apikey: this.password,
            mobile: '91' + (sms.numbers && sms.numbers.join()),
            message: sms.message,
            senderid: sms.senderId,
            type: 'txt',
        };
    }
    validate(sms: SmsHorizonProviderModel): boolean {
        return true;
    }
    public async send(sms: SmsHorizonProviderModel): Promise<request.RequestResponse> {
        sms.senderId = SmsConfig['SENDER_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: CannySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export interface DreamSoftSmsModel extends SmsModel {
    senderId: string;
}

export class SmsDreamSoftProvider implements SmsProvider {
    public get url() {
        return 'http://bulksms.teamdreamsoft.com/api/api.php?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: DreamSoftSmsModel) {
        return {
            ver: 1,
            mode: 1,
            action: 'push_sms',
            type: 1,
            route: 2,
            login_name: this.userName,
            api_password: this.password,
            message: sms.message,
            number: '91' + (sms.numbers && sms.numbers.join()),
            sender: sms.senderId
        };
    }
    validate(sms: DreamSoftSmsModel): boolean {
        return true;
    }
    public async send(sms: DreamSoftSmsModel): Promise<request.RequestResponse> {
        sms.senderId = SmsConfig['SENDER_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: CannySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export interface AmruthaSmsModel extends SmsModel {
    senderId: string;
}

export class SmsAmruthaProvider implements SmsProvider {
    public get url() {
        return 'http://37.48.104.204/api/mt/SendSMS?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: AmruthaSmsModel) {
        return {
            user: this.userName,
            password: this.password,
            senderid: sms.senderId,
            channel: 'Trans',
            DCS: 0,
            flashsms: 0,
            number: '91' + (sms.numbers && sms.numbers.join()),
            text: sms.message,
            route: 1
        };
    }
    validate(sms: AmruthaSmsModel): boolean {
        return true;
    }
    public async send(sms: AmruthaSmsModel): Promise<request.RequestResponse> {
        sms.senderId = SmsConfig['SENDER_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: CannySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export class SmsSolluProvider implements SmsProvider {
    public get url() {
        return 'https://app.sollu.in/api/transactional_sms?';
    }
    private apiKey: string;
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    getParams(sms: SolluSmsModel) {
        return {
            apikey: this.apiKey,
            message: sms.message,
            mnumber: '91' + (sms.numbers && sms.numbers.join()),
            entityid: sms.entityId,
            templateid: sms.templateId,
            smstype: 'Trans'
        };
    }
    validate(sms: SolluSmsModel): boolean {
        return true;
    }
    public async send(sms: SolluSmsModel): Promise<request.RequestResponse> {
        sms.senderId = SmsConfig['SENDER_ID'];
        sms.entityId = SmsConfig['ENTITY_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: SolluSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export class SmsNsiteProvider implements SmsProvider {
    public get url() {
        return 'http://164.52.202.248:6005/api/v2/SendSMS?';
    }
    private apiKey: string;
    private clientId: string;
    constructor(apiKey: string, clientId: string) {
        this.apiKey = apiKey;
        this.clientId = clientId;
    }
    getParams(sms: NsiteSmsModel) {
        return {
            ApiKey: this.apiKey,
            ClientId: this.clientId,
            SenderId: SmsConfig['SENDER_ID'],
            Message: sms.message,
            MobileNumbers: '91' + (sms.numbers && sms.numbers.join()),
            //entityid: sms.entityId,
            //templateid: sms.templateId,
            //smstype: 'Trans'
        };
    }
    validate(sms: NsiteSmsModel): boolean {
        return true;
    }
    public async send(sms: NsiteSmsModel): Promise<request.RequestResponse> {
        //sms.SenderId = SmsConfig['SENDER_ID'];
        //sms.entityId = SmsConfig['ENTITY_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: NsiteSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

export class VScanProvider implements SmsProvider {
    public get url() {
        return 'https://fastsms.expressad.in/api/v1/send_sms?';
    }
    private apiKey: any;
    constructor(apiKey: any) {
        this.apiKey = apiKey;
    }
    getParams(sms: VScanSmsModel) {
        return {
            'api-key': this.apiKey,
            'sender-id': SmsConfig['SENDER_ID'],
            'message': sms.message,
            'mobile': '91' + (sms.numbers && sms.numbers.join()),
            'sms-type': 1,
            'te_id': sms.templateId
            //entityid: sms.entityId,
            //templateid: sms.templateId,
            //smstype: 'Trans'
        };
    }
    validate(sms: VScanSmsModel): boolean {
        return true;
    }
    public async send(sms: VScanSmsModel): Promise<request.RequestResponse> {
        //sms.SenderId = SmsConfig['SENDER_ID'];
        //sms.entityId = SmsConfig['ENTITY_ID'];
        return new Promise<any>((resolve, reject) => {
            request.get(this.url, { timeout: 5000, qs: this.getParams(sms) },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log(error);
                        resolve(error);
                    }
                    resolve(response);
                });
        });
    }
    public sendMultiple(sms: VScanSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }
}

// https://sms.sendmsg.in/smpp?password=pmPGnRVvn&from=HOSMAT&smsmsgid=XXX&to=91XXXXXXXX&text=XXXXX%20XXXXX%20XXXXX%20XXXX&urlshortening=1
export class HosmatProvider implements SmsProvider {
    public get url() {
        return 'https://sms.sendmsg.in/smpp?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: HosmatSmsModel) {
        return {
            'username': SmsConfig['USER_NAME'],
            'password': SmsConfig['PASSWORD'],
            'from': 'HOSMAT',
            'smsmsgid': sms.templateId,
            'to': (sms.numbers && sms.numbers.join()),
            'text': sms.message,
            // 'urlshortening': 1,
            // 'sender': SmsConfig['SENDER_ID'],
            // // 'number': '91' + (sms.numbers && sms.numbers.join()),
            //entityid: sms.entityId,
            //templateid: sms.templateId,
            //smstype: 'Trans'
        };
    }
    validate(sms: HosmatSmsModel): boolean {
        return true;
    }
    public async send(sms: HosmatSmsModel): Promise<request.RequestResponse> {
        //sms.SenderId = SmsConfig['SENDER_ID'];
        //sms.entityId = SmsConfig['ENTITY_ID'];
        return new Promise<any>((resolve, reject) => {
            let qs: any = {
                'username': this.userName,
                'password': this.password,
                'from': 'HOSMAT',
                'smsmsgid': sms.templateId,
                'to': (sms.numbers && sms.numbers.join()),
                'text': sms.message,
            };
            let queryString = this.getQueryString(qs);
            let url = this.url + queryString;
            const req = request.get(url, { timeout: 60000, strictSSL: false },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log('*****SMS Error******');
                        console.log(error);
                        reject(error);
                    }
                    console.log('*****SMS Response******');
                    console.log(response);
                    resolve({ response });
                });
            req.on('error', function (e: any) {
                console.log('ERROR:');
                console.log(e);
            });
        });
    }
    public sendMultiple(sms: HosmatSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }

    private getQueryString(data: any): any {
        let result = '';
        let keys = Object.keys(data);
        for (let key of keys) {
            result += key + '=' + data[key] + '&';
        }
        result = result.substr(0, result.length - 1);
        console.log('query string ', result);
        return result;
    }
}

export class JssProvider implements SmsProvider {
    public get url() {
        return 'https://www.smsstriker.com/API/sms.php?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: JssSmsModel) {
        return {
            'username': SmsConfig['USER_NAME'],
            'password': SmsConfig['PASSWORD'],
            'from': 'JSSHSP',
            'to': (sms.numbers && sms.numbers.join()),
            'msg': sms.message,
            'type': 1,
            'template_id': sms.templateId,
        };
    }
    validate(sms: JssSmsModel): boolean {
        return true;
    }
    public async send(sms: JssSmsModel): Promise<request.RequestResponse> {
        return new Promise<any>((resolve, reject) => {
            let qs: any = {
                'username': this.userName,
                'password': this.password,
                'from': 'JSSHSP',
                'to': (sms.numbers && sms.numbers.join()),
                'msg': sms.message,
                'type': 1,
                'template_id': sms.templateId,
            };
            let queryString = this.getQueryString(qs);
            let url = this.url + queryString;
            const req = request.get(url, { timeout: 60000, strictSSL: false },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log('*****SMS Error******');
                        console.log(error);
                        reject(error);
                    }
                    console.log('*****SMS Response******');
                    console.log(response);
                    resolve({ response });
                });
            req.on('error', function (e: any) {
                console.log('ERROR:');
                console.log(e);
            });
        });
    }
    public sendMultiple(sms: JssSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }

    private getQueryString(data: any): any {
        let result = '';
        let keys = Object.keys(data);
        for (let key of keys) {
            result += key + '=' + data[key] + '&';
        }
        result = result.substr(0, result.length - 1);
        console.log('query string ', result);
        return result;
    }
}

export class CauveryProvider implements SmsProvider {
    public get url() {
        return 'http://reseller.smschub.com/api/sms/';
    }
    private apiKey: any;
    constructor(apiKey: any) {
        this.apiKey = apiKey;
    }
    getParams(sms: CauverySmsModel) {
        return {
            'sender': SmsConfig['SENDER_ID'],
            'mobile': (sms.numbers && sms.numbers.join()),
            'route': 'TL',
            'text': sms.message,
            'pe_template_id': sms.templateId,
            'pe_id': '1201159245835627079'
        };
    }
    validate(sms: CauverySmsModel): boolean {
        return true;
    }
    public async send(sms: CauverySmsModel): Promise<any> {
        try {
            const httpOptions = {
                timeout: 40000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Authentication-Key': this.apiKey,
                    'X-Api-Method': 'MT',
                },
                strictSSL: false,
                form: this.getParams(sms)
                // body: this.getParams(sms),
                // json: true
            };
            return new Promise<any>((resolve, reject) => {
                request.post(this.url, httpOptions,
                    (error: any, response: request.RequestResponse, body: any) => {
                        if (error) {
                            console.error('Error sending SMS:', error);
                            // reject(error);
                        } else {
                            console.log('SMS sent successfully:', body);
                            resolve({ body, response });
                        }
                    });
            });
        } catch (ex) { console.log('Error sending messages:', ex); }
    }
    public sendMultiple(sms: CauverySmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }


}

export class ShuvadharshiniProvider implements SmsProvider {
    public get url() {
        return 'https://enterprise.cloudsvas.com/api/sendsms?';
    }
    private userName: string;
    private password: string;
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    getParams(sms: ShuvadharshiniSmsModel) {
        return {
            'route': 'Transactional',
            'senderid': 'SUVAHS',
            'message': sms.message,
            'mobilenumber': (sms.numbers && sms.numbers.join()),
            'userid': SmsConfig['USER_NAME'],
            'password': SmsConfig['PASSWORD'],
            'teid': sms.templateId,
        };
    }
    validate(sms: ShuvadharshiniSmsModel): boolean {
        return true;
    }
    public async send(sms: ShuvadharshiniSmsModel): Promise<request.RequestResponse> {
        return new Promise<any>((resolve, reject) => {
            let qs: any = {
                'route': 'Transactional',
                'senderid': 'SUVAHS',
                'message': sms.message,
                'mobilenumber': (sms.numbers && sms.numbers.join()),
                'userid': this.userName,
                'password': this.password,
                'teid': sms.templateId,
            };
            let queryString = this.getQueryString(qs);
            let url = this.url + queryString;
            const req = request.get(url, { timeout: 60000, strictSSL: false },
                (error: any, response: request.RequestResponse, body: any) => {
                    if (error) {
                        console.log('*****SMS Error******');
                        console.log(error);
                        reject(error);
                    }
                    console.log('*****SMS Response******');
                    console.log(response);
                    resolve({ response });
                });
            req.on('error', function (e: any) {
                console.log('ERROR:');
                console.log(e);
            });
        });
    }
    public sendMultiple(sms: ShuvadharshiniSmsModel[]): Promise<request.RequestResponse[]> {
        return Promise.all(sms.map(msg => (async (msg) => this.send(msg))(msg)));
    }

    private getQueryString(data: any): any {
        let result = '';
        let keys = Object.keys(data);
        for (let key of keys) {
            result += key + '=' + data[key] + '&';
        }
        result = result.substr(0, result.length - 1);
        console.log('query string ', result);
        return result;
    }
}

export class SmsFactory {
    public static GetSmsProvider(provider: string, userName?: string, password?: string, apiKey?: string, clientId?: string) {
        let res: SmsProvider;
        switch (provider) {
            case 'INTEGRA':
                res = new SmsIntegraProvider(userName, password);
                break;
            case 'CANNY':
                res = new SmsCannyInfoProvider(userName, password);
                break;
            case 'BOANCOMM':
                res = new SmsBoneInfoProvider(userName, password);
                break;
            case 'INWAY':
                res = new SmsInWayProvider(userName, password);
                break;
            case 'DREAMSOFT':
                res = new SmsDreamSoftProvider(userName, password);
                break;
            case 'AMRUTHA':
                res = new SmsAmruthaProvider(userName, password);
                break;
            case 'HORIZON':
                res = new SmsHorizonProvider(userName, password);
                break;
            case 'DEEPAM':
                res = new SmsSolluProvider(apiKey);
                break;
            case 'NSITE':
                res = new SmsNsiteProvider(apiKey, clientId);
                break;
            case 'VSCAN':
                res = new VScanProvider(apiKey);
                break;
            case 'HOSMAT':
                res = new HosmatProvider(userName, password);
                break;
            case 'CAUVERY':
                res = new CauveryProvider(apiKey);
                break;
            case 'JSS':
                res = new JssProvider(userName, password);
                break;
            case 'SHUVADHARSHINI':
                res = new ShuvadharshiniProvider(userName, password);
                break;
            default:
                res = null;
                break;
        }
        return res;
    }
}
