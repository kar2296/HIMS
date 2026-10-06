import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse, ConferenceService } from '../../../Common/Index';
import { VirtualConferenceInstance, VirtualConferenceAttributes } from '../Model/Interface/Index';
import { VirtualConferenceFilters, VirtualConferenceParticipantFilters } from '../Common/Filters.e';
import * as moment from 'moment';
import { VirtualConferenceParticipantBo } from './VirtualConferenceParticipantBo';

export class VirtualConferenceBo extends BaseBo<VirtualConferenceInstance, VirtualConferenceAttributes> {
    public async AddVirtualConference(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualConference(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVirtualConferenceById(req: BaseRequest): Promise<VirtualConferenceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualConferences(apiReq?: ApiRequest<VirtualConferenceFilters>): Promise<ApiResponse<VirtualConferenceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let Orderwhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqOrderSearch: boolean = false;
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualConferenceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualConferenceFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case VirtualConferenceFilters.ConferenceSchDate:
                        where['ConferenceScheduleDate'] = { '$between': param.Value || '' };
                        break;
                    case VirtualConferenceFilters.From:
                        where['ConferenceScheduleDate'] = where['ConferenceScheduleDate'] || {};
                        (where['ConferenceScheduleDate'] as any)['$gte'] = param.Value;
                        break;
                    case VirtualConferenceFilters.To:
                        where['ConferenceScheduleDate'] = where['ConferenceScheduleDate'] || {};
                        (where['ConferenceScheduleDate'] as any)['$lte'] = param.Value;
                        break;
                    case VirtualConferenceFilters.OrderId:
                        where['OrderId'] = param.Value;
                        break;
                    case VirtualConferenceFilters.VirtualOrderStatusId:
                        Orderwhere['VirtualOrderStatusId'] = param.Value;
                        isReqOrderSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'ASC']);
        include.push({
            model: this.Models.VirtualOrder,
            required: isReqOrderSearch,
            where: Orderwhere,
            include: [
                this.GetReference('VirtualOrderStatus'),
                { model: this.Models.VirtualSubCategory, required: false }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualConference(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualConferenceInstance, VirtualConferenceAttributes> {
        return this.Models.VirtualConference;
    }

    // Conferece related methods starts

    public async createRoom(data: any): Promise<any> {
        const conferenceService = new ConferenceService();
        let conference = await this.GetVirtualConferenceById({ Id: data.conferenceId });
        let meetConfig = await this.getMeetConfig();

        console.log('meetConfig');
        console.log(meetConfig);
        // check meeting status if roomid already exist
        if (conference.ConferenceRoomId) {
            const isMeetingRunning = await this.isMeetingRunning(conference.ConferenceRoomId, meetConfig);
            if (isMeetingRunning) {
                return true;
            }
        }

        const uuidv1 = require('uuid/v1');
        const meetingId = uuidv1();
        let inputData = {
            meetingId: meetingId,
            meetingName: conference.ConferenceName,
            allowRecording: conference.AllowRecording ? true : false,
            webcamsOnlyForModerator: false,
            lockSettingsDisablePrivateChat: false,
            lockSettingsDisableCam: false,
            // webcamsOnlyForModerator: conference.WebcamsOnlyForModerator ? true : false,
            // lockSettingsDisablePrivateChat: conference.LockSettingsDisablePrivateChat ? true : false,
            // lockSettingsDisableCam: conference.LockSettingsDisableCam ? true : false
        };

        let result = await conferenceService.createRoom(inputData, meetConfig);
        console.log('create room external api response');
        console.log(result);

        if (result.response && result.response.statusCode === 200) {
            conference.ConferenceRoomId = meetingId;
            conference.ConferenceStatusId = 2;
            conference.StartTime = moment.utc().toDate();
            await this.UpdateVirtualConference({ Id: conference.Id, Data: conference });

            // TODO
            // save session details in conference session
            // const conferenceSessionBo = this.getConferenceSessionBo(this.request);
            // let sessionDetails: any = {
            //     conferenceId: conference.id,
            //     conferenceRoomId: conference.conferenceRoomId,
            //     startTime: moment.utc().toDate(),
            //     isActive: true
            // };
            // await conferenceSessionBo.addConferenceSession(sessionDetails);
        } else {
            throw new Error('Error in conference room creation');
        }
        return true;
    }
    public async getAttendeeJoinUrl(data: any): Promise<any> {
        let participantDetail = await this.getParticipantDetail(data);
        let conferenceDetail = await this.GetVirtualConferenceById({ Id: data.conferenceId });
        let meetConfig = await this.getMeetConfig();

        // check meeting status
        if (conferenceDetail.ConferenceRoomId) {
            const isMeetingRunning = await this.isMeetingRunning(conferenceDetail.ConferenceRoomId, meetConfig);
            if (!isMeetingRunning) {
                return null;
            }

            const conferenceService = new ConferenceService();
            let inputData = {
                meetingId: conferenceDetail.ConferenceRoomId,
                fullName: participantDetail.ParticipantName,
                userId: participantDetail.ParticipantUserId
            };

            return await conferenceService.getAttendeeJoinUrl(inputData, meetConfig);
        }
        return null;
    }

    public async getModeratorJoinUrl(data: any): Promise<any> {
        let conferenceDetail = await this.GetVirtualConferenceById({ Id: data.conferenceId });
        const conferenceService = new ConferenceService();
        let inputData = {
            meetingId: conferenceDetail.ConferenceRoomId,
            fullName: conferenceDetail.DoctorName,
            userId: conferenceDetail.DoctorId
        };
        let meetConfig = await this.getMeetConfig();
        return await conferenceService.getModeratorJoinUrl(inputData, meetConfig);
    }

    public async getGuestJoinUrl(data: any): Promise<any> {
        let conferenceDetail = await this.GetVirtualConferenceById({ Id: data.conferenceId });
        let meetConfig = await this.getMeetConfig();

        // check meeting running status
        const isMeetingRunning = await this.isMeetingRunning(conferenceDetail.ConferenceRoomId, meetConfig);
        if (!isMeetingRunning) {
            return null;
        }

        const conferenceService = new ConferenceService();
        let inputData = {
            meetingId: conferenceDetail.ConferenceRoomId,
            fullName: data.guestName
        };

        return await conferenceService.getAttendeeJoinUrl(inputData, meetConfig);
    }
    public async isMeetingRunning(meetingId: any, meetConfig: any): Promise<any> {
        const conferenceService = new ConferenceService();
        let meetingStatusObj: any;
        let inputData = {
            meetingId: meetingId
        };
        let meetingStatus = await conferenceService.getMeetingInfo(inputData, meetConfig);
        const response = meetingStatus ? meetingStatus.response : { body: '' };
        var parseString = require('xml2js').parseString;
        parseString(response.body, function (err: any, result: any) {
            if (result && result.response) {
                meetingStatusObj = result.response;
            }
            console.log(err);
        });
        console.log(meetingStatusObj);
        if (meetingStatusObj && meetingStatusObj.returncode && meetingStatusObj.returncode.length > 0) {
            const returncode = meetingStatusObj.returncode[0];
            if (returncode === 'SUCCESS') {
                return true;
            }
        }
    }

    public async getParticipantDetail(data: any): Promise<any> {
        if (data.conferenceId > 0) {
            let virtualConferenceParticipantBo = BoFactory.GetBo(VirtualConferenceParticipantBo, this.Request);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: VirtualConferenceParticipantFilters.ConferenceId, Value: data.conferenceId },
                    { Key: VirtualConferenceParticipantFilters.ParticipantUserId, Value: this.Session.UserId }
                ]
            };
            let result = await virtualConferenceParticipantBo.GetVirtualConferenceParticipants(apiReq);
            if (result && result.Data.length === 1) {
                return result.Data[0];
            } else {
                throw new Error('Error while retrieve participant details');
            }
        }
    }

    public async getMeetConfig() {
        const meetConfig = { meetSecret: process.env.MEET_SHARED_SECRET, meetBaseUri: process.env.MEET_BASE_URI };
        return meetConfig;
    }

    // Conference related methods ends
}
