import * as http from 'request';
// import { getSession } from '@cloudedu-api/common';

export class ConferenceService {

    public async createRoom(data: any, meetConfig: any): Promise<any> {
        console.log('<--ConferenceHomeXML-->');
        console.log(this.getConferenceHomeXML());
        return new Promise<any>((resolve, reject) => {
            let qs = this.getCreateMethodParams(data, meetConfig);
            let queryString = this.getQueryString(qs);

            let finalurl = meetConfig.meetBaseUri + 'create?' + queryString;

            let httpOptions = {
                timeout: 60000,
                headers: {
                    'Content-Type': 'application/xml; charset=UTF-8'
                },
                body: this.getConferenceHomeXML()
            };

            http.post(finalurl, httpOptions,
                (error: any, response: http.RequestResponse, body: any) => {
                    if (error) {
                        reject(error);
                    }
                    resolve({ response });
                });
        });
    }

    public getModeratorJoinUrl(data: any, meetConfig: any): any {
        let qs: any = {
            fullName: encodeURI(data.fullName),
            meetingID: data.meetingId,
            password: this.getModeratorPassword(),
            redirect: true,
            userID: data.userId
        };
        let queryString = this.getQueryString(qs);
        let checksum = this.getChecksum(qs, 'join', meetConfig);
        queryString += '&checksum=' + checksum;

        let url = meetConfig.meetBaseUri + 'join?' + queryString;
        console.log('Moderator URL --> ', url);
        return url;
    }

    public getAttendeeJoinUrl(data: any, meetConfig: any): any {
        let qs: any = {
            fullName: encodeURI(data.fullName),
            meetingID: data.meetingId,
            password: this.getAttenderPassword(),
            redirect: true
        };
        if (data.userId) {
            qs['userID'] = data.userId;
        }
        let queryString = this.getQueryString(qs);
        let checksum = this.getChecksum(qs, 'join', meetConfig);
        queryString += '&checksum=' + checksum;

        let url = meetConfig.meetBaseUri + 'join?' + queryString;
        console.log('Attendee URL --> ', url);
        return url;
    }

    public getMeetingInfo(data: any, meetConfig: any): any {
        return new Promise<any>((resolve, reject) => {
            let qs: any = {
                meetingID: data.meetingId,
                password: this.getModeratorPassword()
            };
            let queryString = this.getQueryString(qs);
            let checksum = this.getChecksum(qs, 'getMeetingInfo', meetConfig);
            queryString += '&checksum=' + checksum;

            let url = meetConfig.meetBaseUri + 'getMeetingInfo?' + queryString;
            http.get(url, { timeout: 60000 },
                (error: any, response: http.RequestResponse, body: any) => {
                    if (error) {
                        reject(error);
                    }
                    resolve({ response });
                });
        });
    }

    private getBaseUrl(): any {
        const baseUrl = process.env.BASE_URI || 'http://localhost:3000/';
        return baseUrl;
    }

    private getLogoutUrl(): any {
        const baseUrl = this.getBaseUrl() + '#';
        return baseUrl;
    }

    private getAttenderPassword(): any {
        return 'aphm';
    }

    private getModeratorPassword(): any {
        return 'mphm';
    }

    private getConfHomeUrl(): any {
        let confHomeUrl = this.getBaseUrl() + 'assets/conference/conf_home.pdf';
        return confHomeUrl;
    }

    private getConferenceHomeXML(): any {
        const xml2js = require('xml2js');
        const builder = new xml2js.Builder();

        const confHomeConfig = {
            modules: {
                module: {
                    document: {
                        $: {
                            url: this.getConfHomeUrl()
                        }
                    },
                    $: {
                        name: 'presentation'
                    }
                }
            }
        };
        var xml = builder.buildObject(confHomeConfig);
        return xml;
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

    private getChecksum(qs: any, methodName: any, meetConfig: any): any {
        let queryString = this.getQueryString(qs);
        let shaParam = methodName + queryString + meetConfig.meetSecret;
        const sha1 = require('js-sha1');
        const checkSum = sha1(shaParam);
        return checkSum;
    }

    // Create room methods
    private getCreateMethodParams(data: any, meetConfig: any): any {
        let meetingName = encodeURI(data.meetingName);
        let logoutURL = encodeURIComponent(this.getLogoutUrl());
        let qs: any = {
            allowStartStopRecording: data.allowRecording,
            attendeePW: this.getAttenderPassword(),
            autoStartRecording: false,
            logoutURL: logoutURL,
            meetingID: data.meetingId,
            moderatorPW: this.getModeratorPassword(),
            name: meetingName,
            record: data.allowRecording,
            webcamsOnlyForModerator: data.webcamsOnlyForModerator,
            lockSettingsDisablePrivateChat: data.lockSettingsDisablePrivateChat,
            lockSettingsDisableCam: data.lockSettingsDisableCam
        };
        qs.checksum = this.getChecksum(qs, 'create', meetConfig);
        return qs;
    }
}
