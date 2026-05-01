import * as http from 'request';

export class WhatsappNotificationService {

    public async sendNotification(message: any, phoneNo: any) {
        const data = {
            'to': phoneNo, //'+919XXXXXXXX',
            'message': message
        };
        console.log(message, '________________kkkkk_________________', phoneNo);

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'x-access-token': 'ophgPEouReOHcltT9V0bV4bZrvNtbnGm'
        };

        const options = {
            host: 'whatsapp.drhms.in',
            path: '/message/send',
            method: 'POST',
            headers: headers,
            rejectUnauthorized: false,
        };
        const https = require('https');

        const req = https.request(options, function (res: any) {
            res.on('data', function (item: any) {
                console.log('Response:');
                console.log(JSON.parse(item));
            });
        });

        req.on('error', function (e: any) {
            console.log('ERROR:');
            console.log(e);
        });

        req.write(JSON.stringify(data));
        req.end();

        return true;
    }

    public async sendMessage(message: any) {
        return new Promise<any>((resolve, reject) => {
            // const data = {
            //     'to': phoneNo, //'+919XXXXXXXX',
            //     'message': message
            // };
            let inputData:any = {};
            inputData = message;
            // console.log(message, '________________kkkkk_________________', phoneNo);

            let finalurl = '';
            let headers: any = {};

            if (WhatsAppConfig['PROVIDER'] === 'ProMed') {
                let link = 'whatsapp-api/v1.0/customer/72795/bot/d09308d8677f48d9/template';
                finalurl = process.env.WHATSAPP_URL + link;
                headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Basic ' + process.env.WHATSAPP_SECRET
                };
                let httpOptions = {
                    // host: process.env.WHATSAPP_URL,
                    // path: '/whatsapp-api/v1.0/customer/72795/bot/d09308d8677f48d9/template',
                    method: 'POST',
                    headers: headers,
                    body: inputData,
                    rejectUnauthorized: false,
                    json: true
                };
                const req = http.post(finalurl, httpOptions,
                    (error: any, response: http.RequestResponse, body: any) => {
                        if (error) {
                            console.log('*****Whatsapp Error******');
                            console.log(error);
                            reject(error);
                        }
                        console.log('*****Whatsapp Response******');
                        console.log(response);
                        resolve({ response });
                    });
                req.on('error', function (e: any) {
                    console.log('ERROR:');
                    console.log(e);
                });
                // req.write(JSON.stringify(inputData));
                // req.end();
                // 'x-access-token': 'ophgPEouReOHcltT9V0bV4bZrvNtbnGm'
            } else if(WhatsAppConfig['PROVIDER'] === 'BeWell') {
                let link = 'dashboardapi/api/crm/send-message?authToken=0cd22cd6-4637-45f6-82c9-5faa6fe9c0b7&organizationId=4177862';
                finalurl = process.env.WHATSAPP_URL + link;
                headers = {
                    'Content-Type': 'application/json;',
                };
                let httpOptions = {
                    // host: process.env.WHATSAPP_URL,
                    // path: '/whatsapp-api/v1.0/customer/72795/bot/d09308d8677f48d9/template',
                    method: 'POST',
                    headers: headers,
                    body: inputData,
                    rejectUnauthorized: false,
                    json: true
                };
                const req = http.post(finalurl, httpOptions,
                    (error: any, response: http.RequestResponse, body: any) => {
                        if (error) {
                            console.log('*****Whatsapp Error******');
                            console.log(error);
                            reject(error);
                        }
                        console.log('*****Whatsapp Response******');
                        console.log(response);
                        resolve({ response });
                    });
                req.on('error', function (e: any) {
                    console.log('ERROR:');
                    console.log(e);
                });
                // req.write(JSON.stringify(inputData));
                // req.end();
                //https://www.kenyt.ai/dashboardapi/api/crm/send-message?authToken=
                //0cd22cd6-4637-45f6-82c9-5faa6fe9c0b7&organizationId= 4177862'
            } else if(WhatsAppConfig['PROVIDER'] === 'Dhee') {
                let link = 'devapi/messages/whatsapp';
                finalurl = process.env.WHATSAPP_URL + link;
                headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                    'apiSecret': 'fc506e302d4b4eea88ce87dbd78ae5c5',
                    'apiKey': '64fec21d362e2c0c7b864772'
                };
                let httpOptions = {
                    // host: process.env.WHATSAPP_URL,
                    // path: '/whatsapp-api/v1.0/customer/72795/bot/d09308d8677f48d9/template',
                    method: 'POST',
                    headers: headers,
                    body: inputData,
                    rejectUnauthorized: false,
                    json: true
                };
                const req = http.post(finalurl, httpOptions,
                    (error: any, response: http.RequestResponse, body: any) => {
                        if (error) {
                            console.log('*****Whatsapp Error******');
                            console.log(error);
                            reject(error);
                        }
                        console.log('*****Whatsapp Response******');
                        console.log(response);
                        resolve({ response });
                    });
                req.on('error', function (e: any) {
                    console.log('ERROR:');
                    console.log(e);
                });
                // req.write(JSON.stringify(inputData));
                // req.end();
            } else if (WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                try {
                finalurl = 'https://app.smartgrowthai.com/sendmessage';
                headers = {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Token': 'SGVhbHRoQ2FyZV5DQVVWRVJZIEhFQVJUICYgTVVMVEktU1BFQ0lBTElUWSBIT1NQSVRBTA=='
                };
                let qs = {
                    TemplateName: inputData.TemplateName,
                    ToNumbersWithCountryCode: ['91' + inputData.ToNumbersWithCountryCode],
                    Message: inputData.msg,
                    BodyParameter: inputData.BodyParameter
                };

                const req = http.post(finalurl, {
                    headers: headers,
                    body: qs,
                    rejectUnauthorized: false,
                    json: true
                }, (error: any, response: http.RequestResponse, body: any) => {
                    if (error) {
                        console.log('*****Whatsapp Error******');
                        console.log(error);
                        // reject(error);
                    }
                    console.log('*****Whatsapp Response******');
                    console.log(response);
                    resolve({ response });
                });

                req.on('error', function (e: any) {
                    console.log('ERROR:');
                    console.log(e);
                });
            } catch (ex) { console.log('Error sending messages:', ex); }
            } else if (WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                finalurl = 'https://3g8zx1.api-in.infobip.com/whatsapp/1/message/template';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'App 80a6c1a6a90ffbb3beb3db7abccc60e7-17f71584-e03a-4ec6-9549-f142b6ca1d87'
                };
                let requestBody: any;
                if (inputData.template === 'registration') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'whatsapp_registration',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.MRN
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                } else if (inputData.template === 'appointmentreschedule') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'whatsapp_rescheduled',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.patientName,
                                                inputData.doctorName,
                                                inputData.displaydate,
                                                inputData.displaytime
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'drpatientadmissionchampion') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'whatsappmess_doctor',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.doctorName,
                                                inputData.patientName,
                                                inputData.displaybed,
                                                inputData.displayward
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'patientadmissionchampion') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'whatsappmess_patient',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.patientName,
                                                inputData.doctorName,
                                                inputData.displaybed,
                                                inputData.displayward
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'patientdischarge') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'patientdischarge',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.patientName
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'drpatientdischarge') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'drpatientdischarge',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.doctorName,
                                                inputData.patientName
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'patientappointment') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'patientappointment',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.patientName,
                                                inputData.doctorName,
                                                inputData.datetime
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'appointmentcancel') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'appointmentcancel',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.patientName,
                                                inputData.doctorName,
                                                inputData.displaydate,
                                                inputData.displaytime
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'drpatientappointment') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'drpatientappointment',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.doctorName,
                                                inputData.patientName,
                                                inputData.date,
                                                inputData.time
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'drpatientappointmentreschedule') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'drpatientappointmentreschedule',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.doctorName,
                                                inputData.patientName,
                                                inputData.date,
                                                inputData.time
                                            ]
                                        }
                                    },
                                    language: 'en_US'
                                }
                            }
                        ]
                    };
                }
                if (inputData.template === 'labreport') {
                    requestBody  = {
                        messages: [
                            {
                                from: '918197715293',
                                to: '91' + inputData.Mobile,
                                content: {
                                    templateName: 'labreport',
                                    templateData: {
                                        body: {
                                            placeholders: [
                                                inputData.patientName,
                                                inputData.contact
                                            ]
                                        },
                                        header: {
                                            type: 'DOCUMENT',
                                            mediaUrl: inputData.link,
                                            filename: inputData.filename
                                            }
                                    },
                                    language: 'en'
                                }
                            }
                        ]
                    };
                }
                const req = http.post(finalurl, {
                    headers: headers,
                    body: requestBody,
                    rejectUnauthorized: false,
                    json: true
                }, (error: any, response: http.RequestResponse, body: any) => {
                    if (error) {
                        console.log('*****Whatsapp Error******');
                        console.log(error);
                        reject(error);
                    }
                    console.log('*****Whatsapp Response******');
                    console.log(response);
                    resolve({ response });
                });
                req.on('error', function (e: any) {
                    console.log('ERROR:');
                    console.log(e);
                });
            } else if (WhatsAppConfig['PROVIDER'] === 'JSS') {
                try {
                    finalurl = 'https://bhashsms.com/api/sendmsg.php';
                    let user = 'jsshospitalsBWA';
                    let pass = 'jHsRn4725';
                    let sender = 'BUZWAP';
                    let priority = 'wa';
                    let stype = 'normal';
                    let htype = 'document';
                    let qs: any = {
                        user: user,
                        pass: pass,
                        sender: sender,
                        phone: inputData.mobile,
                        text: inputData.TemplateName,
                        priority: priority,
                        stype: stype,
                        params: inputData.BodyParameter
                    };
                    if (inputData.pdf) {
                        qs.htype = htype;
                        qs.fname = inputData.filename;
                        qs.url = inputData.pdf;
                    }
                    let queryString = this.getQueryString(qs);
                    let url = finalurl +'?'+ queryString;
                    const req = http.get(url, { timeout: 60000, strictSSL: false },
                        (error: any, response: http.RequestResponse, body: any) => {
                            if (error) {
                                console.log('*****Whatsapp Error******');
                                console.log(error);
                                reject(error);
                            }
                            console.log('*****Whatsapp Response******');
                            console.log(response);
                            resolve({ response });
                        });
                    req.on('error', function (e: any) {
                        console.log('ERROR:');
                        console.log(e);
                    });
                } catch(error) {
                    console.log('Error sending messages to JSS:', error);
                }
            }
            return true;

        });
    }
    private getQueryString(data: any): string {
        let result = '';
        let keys = Object.keys(data);
        for (let key of keys) {
            result += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) + '&';
        }
        result = result.slice(0, -1);
        console.log('Query string:', result);
        return result;
    }
}
