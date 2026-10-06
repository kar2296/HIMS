import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BedTransferInstance, BedTransferAttributes } from '../Model/Interface/Index';
import { BedTransferFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as inPatientBO from '../../IPManagement/Business/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
// import * as encounterBo from '../../Visit/Business/Index';
// import * as generalMasterBo from '../../GeneralMaster/Business/Index';
import * as _ from 'lodash';
import * as regbo from '../../Registration/Business/Index';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import * as moment from 'moment';
import * as generalMasterBo from '../../GeneralMaster/Business/Index';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';

export class BedTransferBo extends BaseBo<BedTransferInstance, BedTransferAttributes> {
    public async AddBedTransfer(req: BaseRequest): Promise<number> {
        let result: any = {};
        let generateBedTransfer = 0;
        if (!req.Data.RequestIdentifier && req.Data.RequestedStatusId === 3) {
            req.Data.RequestIdentifier = null;
            generateBedTransfer = 1;
            await Sequence.Next(SequenceKeys.BedTransferIdentifier);
        }
        if (!req.Data.RequestDate)
            req.Data.RequestDate = new Date();

        if (req.Data.RequestedStatusId === 3 && !req.Data.ReqCompletedBy) {
            req.Data.ReqCompletedBy = this.Session.UserId;
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your transferred on' + moment(req.Data.TransferDate).format('YYYY-MM-DD') + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        result = await this.Save(req.Data);
        let bedTransferId = result.dataValues.Id;

        let wardMasterBO = BoFactory.GetBo(generalMasterBo.WardMasterBo, this.Request);
        let warddata = await wardMasterBO.GetWardMasterById({ Id: req.Data.FromWardId });
        let fromDisplayWard = warddata.Description;
        let wardRoomMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomMasterBo, this.Request);
        let roomData = await wardRoomMasterBO.GetWardRoomMasterById({ Id: req.Data.FromRoomId });
        let fromDisplayRoom = roomData.Description;
        let wardRoomBedMasterBO = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
        let bedData = await wardRoomBedMasterBO.GetWardRoomBedMasterById({ Id: req.Data.FromBedId });
        let fromDisplayBed = bedData.Description;
        let toroomData = await wardRoomMasterBO.GetWardRoomMasterById({ Id: req.Data.ToRoomId });
        let tofromDisplayRoom = toroomData.Description;
        let tobedData = await wardRoomBedMasterBO.GetWardRoomBedMasterById({ Id: req.Data.ToBedId });
        let tofromDisplayBed = tobedData.Description;
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const userData: any = await userBO.GetById(req.Data.DoctorId);
        if (patient.Mobile) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let smsTemplateInfo =
                await eventTemplateBO.GetTemplateInfo('patientWardChange', 'patientWardChange', 1);
            if (smsTemplateInfo) {
                let smsmodel: any = {};
                if (SmsConfig['PROVIDER'] === 'HOSMAT') {
                    smsmodel = {
                        numbers: [patient.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: patient.FirstName,
                                frombed: fromDisplayWard+'/'+fromDisplayRoom+'/'+fromDisplayBed,
                                tobed: req.Data.WardName+'/'+tofromDisplayRoom +'/'+tofromDisplayBed,
                                contactNo: this.Session.FacilityContact

                            })
                    };
                } else {
                    smsmodel = {
                        numbers: [patient.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: patient.FirstName,
                                frombed: fromDisplayWard+'/'+fromDisplayRoom+'/'+fromDisplayBed,
                                tobed: req.Data.WardName+'/'+tofromDisplayRoom +'/'+tofromDisplayBed,
                                contactNo: this.Session.FacilityContact

                            })
                    };
                }
                let smsProvider = this.GetSmsProvider();
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patient.Mobile);
                }
            }
        }
        if (userData.Mobile) {
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                try {
                    let data = {
                        TemplateName: 'bedtrns',
                        mobile: userData.Mobile,
                        BodyParameter: [patient.FirstName, patient.MRN, fromDisplayWard + '/' + fromDisplayRoom + '/' + fromDisplayBed,
                        req.Data.WardName + '/' + tofromDisplayRoom + '/' + tofromDisplayBed]
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the drpatientDischargeJss');
                } catch (error) {
                    console.log('Error Processing messages:', error);
                }
            }
        }
        if (req.Data.RequestedStatusId === 3) {
            let OccupancyBO = BoFactory.GetBo(inPatientBO.BedOccupancyHistoryBo, this.Request);
            await OccupancyBO.ManageBedTransferOccupancyHistory(req);
            // let EncounterBo = BoFactory.GetBo(encounterBo.EncounterBo, this.Request);
            // let bedBo = BoFactory.GetBo(generalMasterBo.WardRoomBedMasterBo, this.Request);
            // let BedInfo = await bedBo.GetWardRoomBedMasterById({ Id: req.Data.ToBedId });
            // let encounter: any = {
            //     Data: {
            //         Id: req.Data.EncounterId,
            //         FacilityId: req.Data.ToFacilityId,
            //         Locationid: req.Data.ToLocationId,
            //         WardId: req.Data.ToWardid,
            //         RoomId: req.Data.ToRoomId,
            //         BedId: req.Data.ToBedId,
            //         ServiceRateCategoryId: BedInfo.ServiceRateCategoryId
            //     }
            // };
            // await EncounterBo.UpdateEncounter(encounter);
        }
        if (generateBedTransfer === 1) {
            this.deferSequenceKey(bedTransferId, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.BedTransferIdentifier));
        }

        return bedTransferId;
    }

    public async UpdateBedTransfer(req: BaseRequest): Promise<boolean> {
        let generateBedTransfer = 0;
        if (!req.Data.RequestIdentifier && req.Data.RequestedStatusId === 3) {
            req.Data.RequestIdentifier = null;
            generateBedTransfer = 1;
            await Sequence.Next(SequenceKeys.BedTransferIdentifier);
        }

        if (!req.Data.RequestDate)
            req.Data.RequestDate = new Date();

        if (req.Data.RequestedStatusId === 3 && !req.Data.ReqCompletedBy) {
            req.Data.ReqCompletedBy = this.Session.UserId;
        }
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.PatientId);
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.DoctorId });
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your transferred on' + moment(req.Data.TransferDate).format('YYYY-MM-DD') + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        // if (doctorData && (doctorData.NotificationToken && req.Data.Header.VirtualOrderStatusId === 8)) {
        if (doctorData && (doctorData.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + doctorData.FirstName + ', ' + patient.FirstName + ', ' + ' transferred on' + moment(req.Data.TransferDate).format('YYYY-MM-DD') + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (doctorData.NotificationToken) {
                pushTokens.push(doctorData.NotificationToken);
            }
            if (doctorData.WebNotificationToken) {
                pushTokens.push(doctorData.WebNotificationToken);
            }

            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        let result = await this.Update(req.Data);
        if (generateBedTransfer === 1) {
            this.deferSequenceKey(req.Data.Id, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.BedTransferIdentifier));
        }

        if (req.Data.RequestedStatusId === 3) {
            // let OccupancyBO = BoFactory.GetBo(inPatientBO.BedOccupancyHistoryBo, this.Request);
            // await OccupancyBO.ManageBedTransferOccupancyHistory(req);
        }
        return result;
    }

    public async GetBedTransferById(req: BaseRequest): Promise<BedTransferAttributes> {
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], as: 'ToWard', required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'ToRoom', required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], as: 'ToBed', required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], as: 'FromWard', required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'FromRoom', required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], as: 'FromBed', required: false });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetBedTransfers(apiReq?: ApiRequest<BedTransferFilters>): Promise<ApiResponse<BedTransferAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], as: 'ToWard', required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'ToRoom', required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], as: 'ToBed', required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], as: 'FromWard', required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], as: 'FromRoom', required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], as: 'FromBed', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'],
            as: 'FromServiceRateCategory', required: false
        });
        include.push({
            model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'],
            as: 'ToServiceRateCategory', required: false
        });
        include.push(this.GetReference('RequestedStatus'));
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Created', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ReqCompleted', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedTransferFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BedTransferFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case BedTransferFilters.FromWardId:
                        where['FromWardId'] = param.Value;
                        break;
                    case BedTransferFilters.RequestedStatusId:
                        where['RequestedStatusId'] = param.Value;
                        break;
                    case BedTransferFilters.RequestDate:
                        where['RequestDate'] = param.Value;
                        break;
                    case BedTransferFilters.From:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case BedTransferFilters.To:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case BedTransferFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case BedTransferFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case BedTransferFilters.FromRoomId:
                        where['FromRoomId'] = param.Value;
                        break;
                    case BedTransferFilters.FromBedId:
                        where['FromBedId'] = param.Value;
                        break;
                    case BedTransferFilters.RequestIdentifier:
                        (where as any)[Op.or] = [{ RequestIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case BedTransferFilters.AdmissionStatusId:
                        where['AdmissionStatusId'] = param.Value;
                        break;
                    case BedTransferFilters.ToBedId:
                        where['ToBedId'] = param.Value;
                        break;
                    case BedTransferFilters.ToRoomId:
                        where['ToRoomId'] = param.Value;
                        break;
                    case BedTransferFilters.ToWardId:
                        where['ToWardId'] = param.Value;
                        break;
                    case BedTransferFilters.FromFacilityId:
                        where['FromFacilityId'] = param.Value;
                        break;
                    case BedTransferFilters.TransferDate:
                        where['TransferDate'] = param.Value;
                        break;
                    case BedTransferFilters.From:
                        where['TransferDate'] = where['TransferDate'] || {};
                        (where['TransferDate'] as any)['$gte'] = param.Value;
                        break;
                    case BedTransferFilters.To:
                        where['TransferDate'] = where['TransferDate'] || {};
                        (where['TransferDate'] as any)['$lte'] = param.Value;
                        break;
                    case BedTransferFilters.RequestedStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['RequestedStatusId'] = { '$in': paramArr };
                        }
                        // where['RequestedStatusId'] = param.Value;
                        break;
                    case BedTransferFilters.IsOtTransfer:
                        where['IsOtTransfer'] = param.Value;
                        break;
                    case BedTransferFilters.ReceivedStatusId:
                        where['ReceivedStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['RequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async TransferCount(req: BaseRequest): Promise<any> {
        let WardGroup: { [id: number]: any[] } = {};
        let FromWardGroupJoin: any = {
            model: this.Models.WardMaster,
            as: 'FromWard',
            required: true,
        };
        let ToWardGroupJoin: any = {
            model: this.Models.WardMaster,
            as: 'ToWard',
            required: true,
        };
        let transferoutInstance: any = await this.FindAll({
            attributes: ['RequestedStatusId', 'FromWardId'],
            where: {
                TransferDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RequestedStatusId: 3,
                // WardId: { '$eq': req.Data.WardId },
                FromFacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 2 }
            },
            include: [FromWardGroupJoin]
        });
        if (transferoutInstance) {
            let groupbills = _.groupBy(transferoutInstance, 'FromWardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let TransferOutCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                TransferOutCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.FromWardId;
                    WardName = bills.FromWard.WardName;
                    // GuarantorType = bills.GuarantorType.Description;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'TransferOutCount': TransferOutCount
                };
                WardGroup[WardId].push(info);
            }
        }

        let transferinInstance: any = await this.FindAll({
            attributes: ['RequestedStatusId', 'ToWardId'],
            where: {
                TransferDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                RequestedStatusId: 3,
                // WardId: { '$eq': req.Data.WardId },
                FromFacilityId: req.Data.FacilityId,
                // AdmissionStatusId: { '$eq': 2 }
            },
            include: [ToWardGroupJoin]
        });
        if (transferinInstance) {
            let groupbills = _.groupBy(transferinInstance, 'ToWardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let TransferInCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                TransferInCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.ToWardId;
                    WardName = bills.ToWard.WardName;
                    // GuarantorType = bills.GuarantorType.Description;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'TransferInCount': TransferInCount
                };
                WardGroup[WardId].push(info);
            }
        }

        return WardGroup;
    }

    public async GetBedTransferByEncounterId(req: BaseRequest): Promise<BedTransferAttributes> {
        let response: any = {};
        let bedTransferId = await this.GetExistBedTransferRequest({
            where: {
                EncounterId: req.Data.EncounterId,
                RequestedStatusId: { '$in': [1, 2] }
            },
            attributes: ['Id']
        });

        if (bedTransferId > -1) {
            let bedTransferApi = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedTransferFilters.Id, Value: bedTransferId }]
            };
            let bedTransfers = await this.GetBedTransfers(bedTransferApi);
            if (bedTransfers.Data.length > 0)
                response = bedTransfers.Data[0];
        } else
            response.Id = bedTransferId;
        return response;
    }

    public async GetExistBedTransferRequest(foption: SStatic.FindOptions<any>): Promise<number> {
        let BedTransferId: number = -1;
        let BedTransferInstance: any = await this.Find(foption);
        if (BedTransferInstance) {
            let bedTransfer = this.GetAttribute(BedTransferInstance);
            BedTransferId = bedTransfer.Id;
        } return BedTransferId;
    }


    public async DeleteBedTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintBedTransferReport(apiReq?: ApiRequest<BedTransferFilters>): Promise<any> {
        let data = await this.GetBedTransfers(apiReq);
        let BedTransfers = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let FromWard = apiReq.Data.FromWard;
        let ToWard = apiReq.Data.ToWard;
        let DoctorName = apiReq.Data.DoctorName;
        let BedTransfersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(BedTransfersData.FromFacilityId);
        let info = {
            BedTransfers: BedTransfers,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            FromWard: FromWard,
            DoctorName: DoctorName,
            ToWard: ToWard
        };
        let pdfOption: any = null;
        let key = 'bedtransferreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<BedTransferInstance, BedTransferAttributes> {
        return this.Models.BedTransfer;
    }
}
