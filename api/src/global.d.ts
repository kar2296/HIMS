interface Models { }
declare var SmsConfig: {
    [key: string]: string
}
declare var EmailConfig: {
    [key: string]: string
}
declare var WhatsAppConfig: {
    [key: string]: string
}
declare var LocalWellConfig: {
    [key: string]: string
}
declare namespace Express {
    export interface Request {
        transaction?: any
        deferredSequences: DeferSequenceInfo[];
    }
}
