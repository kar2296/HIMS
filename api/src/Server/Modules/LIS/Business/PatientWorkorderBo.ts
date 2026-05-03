import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import {
    WhereOptions, IncludeOptions, Report,
    FileInfo, SequenceGenerator, Template
} from
    '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientWorkorderInstance, PatientWorkorderAttributes } from '../Model/Interface/Index';
import {
    PatientWorkorderFilters, PatientWorkorderdetailsFilters,
    WorkOrderAttachmentFilters, LISInterfaceResultsFilters
} from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as aptbo from '../../Appointment/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as billBo from '../../Billing/Business/Index';
import * as Encounter from '../../Visit/Business/Index';
import * as Referral from '../../GeneralMaster/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as generalBO from '../../General/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';
import { readFileSync } from 'fs';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { ReferralFilters } from '../../GeneralMaster/Common/Filters.e';
import { PatientOrderFilters, PatientOrderDetailFilters } from '../../EMR/Common/Filters.e';
import { PatientBillsFilters, PatientBillDetailsFilters } from '../../Billing/Common/Filters.e';
import { WorkOrderSampleFilters, WorkOrderSampleDetailFilters } from '../../LIS/Common/Filters.e';
import { unlinkSync } from 'fs';
import * as moment from 'moment';
import { AppConfig } from '../../../../config/index';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';
import {
    PatientFilters
} from '../../Registration/Common/Filters.e';

export class PatientWorkorderBo extends BaseBo<PatientWorkorderInstance, PatientWorkorderAttributes> {
    public async AddPatientWorkorder(req: BaseRequest): Promise<number> {
        if (this.Session.FacilityId && (!req.Data.FacilityId || req.Data.FacilityId === -1))
            req.Data.FacilityId = this.Session.FacilityId;

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientWorkorder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdatePrintPatientWorkorder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let woDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Data.Id },
            { Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedTestList }]
        };
        let wodetdata = await woDetailBO.GetPatientWorkorderdetailss(apiReq);
        let updDetail: any = [];
        for (let dx in wodetdata.Data) {
            let wdata = wodetdata.Data[dx];
            wdata.IsPrinted = true;
            updDetail.push(wdata);
        }
        await woDetailBO.ManagePrintPatientWorkOrderDetails(updDetail);
        return result;
    }

    public async AssignExternalProvider(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let patientoDetBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientwODetBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let patientOrder: any = await patientOBO.GetPatientOrderById({ Id: req.Data.Orderid });
        let ordUpdate: any = {
            Id: patientOrder.Id,
            ExternalLabId: req.Data.ExternalProviderId,
            ExternalOrderStatusId: 2
        };
        await patientOBO.Update(ordUpdate);

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Data.Id }]
        };
        let wodetdata = await patientwODetBO.GetPatientWorkorderdetailss(apiReq);
        if (wodetdata.Data.length > 0) {
            for (let wdx in wodetdata.Data) {
                let wDetailInfo = wodetdata.Data[wdx];
                let wDetupdate: any = {
                    Id: wDetailInfo.Id,
                    ExternalPrice: req.Data.ExternalPrice
                };
                await patientwODetBO.Update(wDetupdate);
            }
        }
        let orderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: req.Data.Orderid }]
        };
        let odetdata = await patientoDetBO.GetPatientOrderDetails(orderReq);
        if (odetdata.Data.length > 0) {
            for (let odx in odetdata.Data) {
                let oDetailInfo = odetdata.Data[odx];
                let ordDetupdate: any = {
                    Id: oDetailInfo.Id,
                    ExternalPrice: req.Data.ExternalPrice
                };
                await patientoDetBO.Update(ordDetupdate);
            }
        }
        return result;
    }

    public async CompleteExternalProvider(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let patientOrder: any = await patientOBO.GetPatientOrderById({ Id: req.Data.Orderid });
        let ordUpdate: any = {
            Id: patientOrder.Id,
            ExternalLabId: req.Data.ExternalProviderId,
            ExternalOrderStatusId: 3,
            OrderStatusId: 11
        };
        await patientOBO.Update(ordUpdate);
        return result;
    }


    public async sendLABApprovedResultSMS(req: BaseRequest): Promise<boolean> {
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let appointmentBo = BoFactory.GetBo(aptbo.AppointmentBo, this.Request);
        let patientData;
        if (req.Data.itemId) {
            if (req.Data.itemId.Patientid) {
                patientData = await patientBO.GetPatientById({ Id: req.Data.itemId.Patientid });
            }
        } else {
            patientData = await patientBO.GetPatientById({ Id: req.Data.itemId.Patientid });
        }

        if (patientData) {
            if (patientData.Mobile) {
                let smsProvider = this.GetSmsProvider();
                let eventTemplateBO = BoFactory.GetBo(appbo.EventTemplateBo, this.Request);
                let smsTemplateInfo = null;
                smsTemplateInfo =
                    await eventTemplateBO.GetTemplateInfo('LabResultApproved', 'LabResultApproved', 1);
                if (smsTemplateInfo) {
                    let vPatientName = '';
                    vPatientName = await appointmentBo.getPatientName(patientData);
                    let smsmodel = {
                        numbers: [patientData.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: vPatientName,
                                webLink: ''
                            })
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                    }
                }
            }
        }
        return true;
    }

    public async ManagePatientWorkOrder(req: BaseRequest): Promise<boolean> {
        console.log(req);
        let result = await this.Update(req.Data.Header);
        let woDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        await woDetailBO.ManagePatientWorkOrderDetails(req.Data.Details);

        //Update patientorder orderstatus - completed, approved
        if (req.Data.Header.WorkOrderStatusId === 4 || req.Data.Header.WorkOrderStatusId === 7) {
            let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
            let orderId = req.Data.Header.Orderid;
            let ord: any = { 'OrderStatusId': 11 }; // completed
            await patientOBO.Update(ord, {
                fields: ['OrderStatusId'],
                where: { 'Id': orderId },
            });
        }

        // if (req.Data.Header.WorkOrderStatusId === 7 || req.Data.Header.WorkOrderStatusId === 9) {
        //     await this.sendLABApprovedResultSMS(req);
        // }

        return result;
    }
    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'resultreview':
    //             count = await this.Items.count({
    //                 where: {
    //                     'WorkOrderStatusId': { '$in': [7, 8, 9] },
    //                     'Orderedbyid': this.GetSession().UserId,
    //                     'TestTypeId': { '$in': [1] }   // Lab

    //                 }
    //             });
    //             break;
    //         case 'radiologyresult':
    //             count = await this.Items.count({
    //                 where: {
    //                     'WorkOrderStatusId': { '$in': [7, 8, 9] },
    //                     'Orderedbyid': this.GetSession().UserId,
    //                     'TestTypeId': { '$in': [2] }   // Radiology

    //                 }
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { count: count };
    // }
    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let labresultcount = await this.Items.count({
            where: {
                'Status': 1,
                'TestTypeId': { '$in': [1] },
                'WorkOrderStatusId': { '$in': [7, 8, 9] },
                'Orderedbyid': req.Data.DoctorId,
            },
            include: [{
                model: this.Models.PatientOrder,
                where: {
                    'OrderStatusId': { '$in': [11] },  //COMPLETED
                    'DoctorId': req.Data.DoctorId,
                    'TestTypeId': { '$in': [1] },   // Lab
                    'ReviewStatusId': null,
                },
                required: true
            }]
        });
        let imagingradiologycount = await this.Items.count({
            where: {
                'Status': 1,
                'WorkOrderStatusId': { '$in': [7, 8, 9] },
                'Orderedbyid': req.Data.DoctorId,
                'TestTypeId': { '$in': [2] },
            },
            include: [{
                model: this.Models.PatientOrder,
                where: {
                    'OrderStatusId': { '$in': [11] },  //COMPLETED
                    'DoctorId': req.Data.DoctorId,
                    'TestTypeId': { '$in': [2] },   // Radiology
                    'ReviewStatusId': null,
                },
                required: true

            }]
        });
        let endoscopycount = await this.Items.count({
            where: {
                'Status': 1,
                'WorkOrderStatusId': { '$in': [7, 8, 9] },
                'Orderedbyid': req.Data.DoctorId,
                'TestTypeId': { '$in': [4] },
            },
            include: [{
                model: this.Models.PatientOrder,
                where: {
                    'ReviewStatusId': null,
                },
                required: true

            }]
        });
        let abnormalcount = await this.Items.count({
            where: {
                'Status': 1,
                'TestTypeId': { '$in': [1] },
                'WorkOrderStatusId': { '$in': [7, 8, 9] },
                'Orderedbyid': req.Data.DoctorId,
            },
            include: [{
                model: this.Models.PatientOrder,
                where: {
                    'OrderStatusId': { '$in': [11] },  //COMPLETED
                    'DoctorId': req.Data.DoctorId,
                    'TestTypeId': { '$in': [1] },   // Lab
                    'ReviewStatusId': null,
                },
                required: true
            }]
        });
        return {
            'labresultcount': labresultcount,
            'imagingradiologycount': imagingradiologycount,
            'endoscopycount': endoscopycount,
            'abnormalcount': abnormalcount
        };
    }
    public async GetPatientWorkorderById(req: BaseRequest): Promise<PatientWorkorderAttributes> {
        let include: Array<IncludeOptions> = [];
        let attributes: any = {};
        attributes['include'] = [];

        if (req.Data && req.Data.WOStatus === 1 && req.Data.IsLabSync === 1) {
            let patientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            let lisResultBo = BoFactory.GetBo(lisbo.LISInterfaceResultsBo, this.Request);
            let lisApiReq = {
                Id: 0,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Params: [{ Key: LISInterfaceResultsFilters.WorkOrderId, Value: req.Id },
                { Key: LISInterfaceResultsFilters.ResultValue, Value: 1 }
                ]
            };
            let lisResultlist = await lisResultBo.GetLISResultsWithoutGroup(lisApiReq);
            for (let dtidx in lisResultlist.Data) {
                var lisResult = lisResultlist.Data[dtidx];
                let ord: any = { 'Resultvalue': lisResult.ResultValue }; // Accepted
                await patientWorkorderdetailsBo.Update(ord, {
                    fields: ['Resultvalue'],
                    where: { 'WorkOrderId': lisResult.WorkOrderId, 'SampleId': lisResult.Sampleid, 'AnalyteId': lisResult.AnalyteId },
                });
            }
        }
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'DoctorName', 'EncounterTypeId', 'AdmissionDate'],
            required: false
        });
        include.push({
            model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate', 'BillNumber', 'EncounterId'], required: false,
            include: [
                { model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false },
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'],
                    as: 'Doctor', required: false,
                    include: [this.GetReference('Title')]
                },
                {
                    model: this.Models.Encounter, attributes: ['WardId', 'RoomId', 'BedId'], required: false,
                    include: [{ model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId'], required: false },
                    { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
                    { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false },]
                }
            ]
        });

        include.push({ model: this.Models.ExternalProvider, attributes: ['ProviderName'], required: false });

        //Workorder status
        include.push({ model: this.Models.WorkOrderStatus, attributes: ['DisplayName'], required: false });

        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'DOB', 'MRNTypeId', 'GenderId'], required: false
        });

        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });

        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Orderedby', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ResultEnteredUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ResultApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                'Qualification', 'LicenseNo'], as: 'MedUser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                },
                {
                    model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false,
                }
            ]
        });
        let totalAttachmentQuery = this.GetSelectQuery(this.Models.WorkOrderAttachment, {
            attributes: [this.Dal.fn('COUNT', this.Dal.col('WorkOrderAttachmentId'))],
            where: [this.Dal.literal('`WorkOrderAttachment`.`WorkOrderId` = `PatientWorkorder`.`Workorderid`'),
            {
                'Status': 1
            }]
        }, 'AttachmentsCount');

        attributes.include.push(totalAttachmentQuery);

        let result = await this.GetById(req.Id, { include: include, attributes: attributes });
        return this.GetAttribute(result);
    }

    public async GetPatientWorkorders(apiReq?: ApiRequest<PatientWorkorderFilters>): Promise<ApiResponse<PatientWorkorderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let PatientOrderWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let isReqEncounterSearch, isReqPatientOrderSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({ model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ResultApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({ model: this.Models.WorkOrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('LabAssignType'));
        include.push(this.GetReference('ExternalOrderStatus'));
        include.push({
            model: this.Models.ExternalProvider, attributes: ['ProviderName', 'PhoneNumber',
                'AddressLine1', 'AddressLine2'],
            required: false
        });

        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'AssignedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'ReleasedByUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Facility, as: 'OtherFacility', required: false
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ResultEnteredUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                'UserName', 'Qualification'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'],
            as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                'UserName', 'LicenseNo'], as: 'Techuser', required: false,
            include: [
                this.GetReference('Title'),
                {
                    model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                'Qualification', 'LicenseNo'], as: 'MedUser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                },
                {
                    model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification'], as: 'Orderedby', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientWorkorderFilters.PendingAssignment:
                        where['UserId'] = { '$eq': null };
                        break;
                    case PatientWorkorderFilters.WorkOrderStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['WorkOrderStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderFilters.IsOrderAssigned:
                        where['UserId'] = { '$ne': null };
                        break;
                    case PatientWorkorderFilters.MyOrders:
                        where['UserId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.TestType:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.WorkOrderdid:
                        (where as any)[Op.or] = [{ WorkOrderId: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientWorkorderFilters.Orderedbyid:
                        where['Orderedbyid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Departmentid:
                        where['Departmentid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    // case PatientWorkorderFilters.Ordereddate:
                    //     where['Ordereddate'] = where['Ordereddate'] || {};
                    //     (where['Ordereddate'] as any)['$gte'] = param.Value;
                    //     break;
                    case PatientWorkorderFilters.Ordereddate:
                        where['Ordereddate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.From:
                        where['Ordereddate'] = where['Ordereddate'] || {};
                        (where['Ordereddate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.To:
                        where['Ordereddate'] = where['Ordereddate'] || {};
                        (where['Ordereddate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.MedValidationdate:
                        where['MedValidationdate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.Fromapprove:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Toapprove:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.EncounterType:
                        encounterWhere['EncounterTypeId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderFilters.WardId:
                        encounterWhere['WardId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderFilters.LabAssignType:
                        where['LabAssignTypeId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ExternalProvider:
                        where['ExternalProviderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Subdepartmentid:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.WorkOrderdid:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.TechValidationdate:
                        where['TechValidationdate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.FromTech:
                        where['TechValidationdate'] = where['TechValidationdate'] || {};
                        (where['TechValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ToTech:
                        where['TechValidationdate'] = where['TechValidationdate'] || {};
                        (where['TechValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.OrderNumber:
                        (PatientOrderWhere as any)[Op.or] = [
                            { OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientWorkorderFilters.OrderStatusId:
                        PatientOrderWhere['$or'] = { 'OrderStatusId': param.Value };
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientWorkorderFilters.Facilityid:
                        where['Facilityid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.VisitIdentifier:
                        (encounterWhere as any).VisitIdentifier = { [Op.like]: '%' + (param.Value || '') + '%' };
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderFilters.ReferenceNo:
                        (where as any)[Op.or] = [{ ReferenceNo: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.PatOrderBill:
                        (where as any)[Op.or] = [{ WorkOrderId: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMrn: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.IsRejected:
                        where['IsRejected'] = param.Value;
                        break;
                    case PatientWorkorderFilters.IsExternalLab:
                        where['IsExternalLab'] = param.Value;
                        break;
                    case PatientWorkorderFilters.SampleIdentifier:
                        (where as any)[Op.or] = [{ SampleIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.ParentWorkOrderId:
                        where['ParentWorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.CreatedAtFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.CreatedAtTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'DoctorName', 'EncounterTypeId', 'AdmissionDate'],
            required: isReqEncounterSearch,
            where: encounterWhere,
            include: [
                this.GetReference('EncounterType'),
                { model: this.Models.WardMaster, attributes: ['WardName'], required: false },
                { model: this.Models.WardRoomMaster, attributes: ['RoomName', 'RoomNo'], required: false },
                { model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false },
                { model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false },
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification'], as: 'Doctor', required: false,
                    include: [
                        this.GetReference('Title')
                    ]
                }
            ]
        });
        include.push({
            model: this.Models.PatientOrder,
            required: isReqPatientOrderSearch,
            where: PatientOrderWhere,
            include: [{
                model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
                include: [this.GetReference('Title')]
            }]
        });
        // include.push(patientQryJoin);
        order.push(['Ordereddate', 'DESC'], ['WorkOrderId', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetMinPatientWorkorders(apiReq?: ApiRequest<PatientWorkorderFilters>): Promise<ApiResponse<PatientWorkorderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let PatientOrderWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let isReqEncounterSearch, isReqPatientOrderSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({ model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false });

        include.push({ model: this.Models.WorkOrderStatus, attributes: ['DisplayName'], required: false });
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        // include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        // include.push(this.GetReference('OrderPriority'));
        // include.push(this.GetReference('LabAssignType'));
        // include.push(this.GetReference('ExternalOrderStatus'));
        // include.push({
        //     model: this.Models.ExternalProvider, attributes: ['ProviderName', 'PhoneNumber',
        //         'AddressLine1', 'AddressLine2'],
        //     required: false
        // });

        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'AssignedUser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        // include.push({
        //     model: this.Models.Facility, as: 'OtherFacility', required: false
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
        //         'UserName', 'Qualification'], as: 'CreatedUser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'],
        //     as: 'ApprovedUser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'UserName'], as: 'Techuser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], as: 'MedUser', required: false,
        //     include: [
        //         this.GetReference('Title'), {
        //             model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
        //         }
        //     ]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification'], as: 'Orderedby', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientWorkorderFilters.PendingAssignment:
                        where['UserId'] = { '$eq': null };
                        break;
                    case PatientWorkorderFilters.WorkOrderStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['WorkOrderStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderFilters.IsOrderAssigned:
                        where['UserId'] = { '$ne': null };
                        break;
                    case PatientWorkorderFilters.MyOrders:
                        where['UserId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.TestType:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.WorkOrderdid:
                        (where as any)[Op.or] = [{ WorkOrderId: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientWorkorderFilters.Orderedbyid:
                        where['Orderedbyid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Departmentid:
                        where['Departmentid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    // case PatientWorkorderFilters.Ordereddate:
                    //     where['Ordereddate'] = where['Ordereddate'] || {};
                    //     (where['Ordereddate'] as any)['$gte'] = param.Value;
                    //     break;
                    case PatientWorkorderFilters.Ordereddate:
                        where['Ordereddate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.From:
                        where['Ordereddate'] = where['Ordereddate'] || {};
                        (where['Ordereddate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.To:
                        where['Ordereddate'] = where['Ordereddate'] || {};
                        (where['Ordereddate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.MedValidationdate:
                        where['MedValidationdate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.Fromapprove:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Toapprove:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.EncounterType:
                        encounterWhere['EncounterTypeId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderFilters.WardId:
                        encounterWhere['WardId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderFilters.LabAssignType:
                        where['LabAssignTypeId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ExternalProvider:
                        where['ExternalProviderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Subdepartmentid:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.WorkOrderdid:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.TechValidationdate:
                        where['TechValidationdate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.FromTech:
                        where['TechValidationdate'] = where['TechValidationdate'] || {};
                        (where['TechValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ToTech:
                        where['TechValidationdate'] = where['TechValidationdate'] || {};
                        (where['TechValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.OrderNumber:
                        (PatientOrderWhere as any)[Op.or] = [
                            { OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientWorkorderFilters.Facilityid:
                        where['Facilityid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.VisitIdentifier:
                        (encounterWhere as any).VisitIdentifier = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderFilters.ReferenceNo:
                        (where as any)[Op.or] = [{ ReferenceNo: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.PatOrderBill:
                        (where as any)[Op.or] = [{ WorkOrderId: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMrn: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.IsRejected:
                        where['IsRejected'] = param.Value;
                        break;
                    case PatientWorkorderFilters.IsExternalLab:
                        where['IsExternalLab'] = param.Value;
                        break;
                    case PatientWorkorderFilters.SampleIdentifier:
                        (where as any)[Op.or] = [{ SampleIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.ParentWorkOrderId:
                        where['ParentWorkOrderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push({
        //     model: this.Models.Patient,
        //     attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
        //         'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
        //         'State', 'Mobile', 'MaritalStatusId'],
        //     required: isReqPatientSearch,
        //     where: patientWhere,
        //     include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        // });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'DoctorName', 'EncounterTypeId', 'AdmissionDate'],
            required: isReqEncounterSearch,
            where: encounterWhere,
            include: [
                this.GetReference('EncounterType'),
                { model: this.Models.WardMaster, attributes: ['WardName'], required: false },
                { model: this.Models.WardRoomMaster, attributes: ['RoomName', 'RoomNo'], required: false },
                { model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false },
                { model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false },
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification'], as: 'Doctor', required: false,
                    include: [
                        this.GetReference('Title')
                    ]
                }
            ]
        });
        include.push({
            model: this.Models.PatientOrder,
            attributes: ['Id', 'OrderRequestDate'],
            // required: isReqPatientOrderSearch,
            // where: PatientOrderWhere,
        });
        // include.push(patientQryJoin);
        order.push(['Ordereddate', 'DESC'], ['WorkOrderId', 'DESC']);
        apiReq.Attributes = ['Id', 'TechValidationdate', 'Orderid',
            'Ordereddate', 'EncounterId', 'WorkOrderId'
        ];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetVirtualPatientWorkorders(apiReq?: ApiRequest<PatientWorkorderFilters>):
        Promise<ApiResponse<PatientWorkorderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let PatientOrderWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let isReqPatientOrderSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({ model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false });
        include.push({ model: this.Models.WorkOrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('LabAssignType'));
        include.push({ model: this.Models.ExternalProvider, attributes: ['ProviderName'], required: false });

        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'AssignedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Facility, as: 'Facility', required: false
        });
        include.push({
            model: this.Models.Facility, as: 'OtherFacility', required: false
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes:
                ['FirstName', 'LastName', 'SignPath'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Department, as: 'UserDept', attributes: ['DepartmentName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes:
                ['FirstName', 'LastName', 'SignPath', 'UserName', 'Qualification', 'SpecialityId'], as: 'Techuser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes:
                ['FirstName', 'LastName', 'SignPath', 'Qualification', 'SpecialityId'], as: 'MedUser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User,
            attributes: ['FirstName', 'LastName', 'Qualification', 'SpecialityId'],
            as: 'Orderedby', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                }

            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientWorkorderFilters.PendingAssignment:
                        where['UserId'] = { '$eq': null };
                        break;
                    case PatientWorkorderFilters.WorkOrderStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['WorkOrderStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderFilters.IsOrderAssigned:
                        where['UserId'] = { '$ne': null };
                        break;
                    case PatientWorkorderFilters.MyOrders:
                        where['UserId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.TestType:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.WorkOrderdid:
                        (where as any)[Op.or] = [{ WorkOrderId: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientWorkorderFilters.Orderedbyid:
                        where['Orderedbyid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Departmentid:
                        where['Departmentid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Ordereddate:
                        where['Ordereddate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.From:
                        where['Ordereddate'] = where['Ordereddate'] || {};
                        (where['Ordereddate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.To:
                        where['Ordereddate'] = where['Ordereddate'] || {};
                        (where['Ordereddate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.MedValidationdate:
                        where['MedValidationdate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.Fromapprove:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Toapprove:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.LabAssignType:
                        where['LabAssignTypeId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ExternalProvider:
                        where['ExternalProviderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.Subdepartmentid:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.WorkOrderdid:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderFilters.TechValidationdate:
                        where['TechValidationdate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderFilters.FromTech:
                        where['TechValidationdate'] = where['TechValidationdate'] || {};
                        (where['TechValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ToTech:
                        where['TechValidationdate'] = where['TechValidationdate'] || {};
                        (where['TechValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderFilters.OrderNumber:
                        (where as any)[Op.or] = [
                            { OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientWorkorderFilters.Facilityid:
                        where['Facilityid'] = param.Value;
                        break;
                    case PatientWorkorderFilters.ReferenceNo:
                        (where as any)[Op.or] = [{ ReferenceNo: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderFilters.PatOrderBill:
                        (where as any)[Op.or] = [{ WorkOrderId: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMrn: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    // case PatientWorkorderFilters.IsVirtualOrders:
                    //     where['IsVirtualOrders'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.SubCategoryId:
                    //     where['SubCategoryId'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.IsVaccineOrders:
                    //     where['IsVaccineOrders'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.IsLabOrders:
                    //     where['IsLabOrders'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.ResultFormatTypeId:
                    //     where['ResultFormatTypeId'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.SampleIdentifier:
                    //     where['$or'] = [{ 'SampleIdentifier': param.Value },
                    //     { 'ManualBarcode': param.Value }];
                    //     break;
                    // case PatientWorkorderFilters.PatientMobile:
                    //     patientWhere['$or'] = [{ 'Mobile': param.Value }];
                    //     isReqPatientSearch = true;
                    //     break;
                    // case PatientWorkorderFilters.IsOxygenOrders:
                    //     where['IsOxygenOrders'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.FromEnd:
                    //     where['OrderCompletedDate'] = where['OrderCompletedDate'] || {};
                    //     (where['OrderCompletedDate'] as any)['$gte'] = param.Value;
                    //     break;
                    // case PatientWorkorderFilters.ToEnd:
                    //     where['OrderCompletedDate'] = where['OrderCompletedDate'] || {};
                    //     (where['OrderCompletedDate'] as any)['$lte'] = param.Value;
                    //     break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus'),
            this.GetReference('Nationality'),
                // { model: this.Models.CityMaster, attributes: ['CityName'], required: false },
                // { model: this.Models.CityMaster, attributes: ['CityName'], as: 'PCityMaster', required: false },
                // { model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false },
                // { model: this.Models.DistrictMaster, attributes: ['DistrictName'], as: 'PDistrictMaster', required: false },
                // { model: this.Models.StateMaster, attributes: ['StateName'], required: false },
                // { model: this.Models.StateMaster, attributes: ['StateName'], as: 'PStateMaster', required: false },
                // { model: this.Models.CountryMaster, attributes: ['CountryName'], required: false },
                // { model: this.Models.CountryMaster, attributes: ['CountryName'], as: 'PCountryMaster', required: false },
                // { model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false },
                // { model: this.Models.PincodeMaster, attributes: ['Pincode'], as: 'PPincodeMaster', required: false },
            ]
        });
        include.push({
            model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate', 'BillNumber',
                'OrderScheduleDate', 'ReferredId'],
            required: isReqPatientOrderSearch,
            where: PatientOrderWhere,
        });
        // include.push(patientQryJoin);
        order.push(['Ordereddate', 'DESC'], ['WorkOrderId', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientWorkorder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async AcceptVirtualOrder(req: BaseRequest): Promise<boolean> {
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let patientOrder: any = await PatientOrderBo.GetPatientOrderById({ Id: req.Id });
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let ids = [];
        if (req.Data.selectedlist.length > 0) {
            patientOrder.OrderStatusId = 10;
        }
        for (var jdx in req.Data.selectedlist) {
            let detail: any = req.Data.selectedlist[jdx];
            ids.push(detail.Id);
        }
        await PatientOrderBo.Update(patientOrder);
        let seqKey: string = SequenceKeys.PatientLISWorkOrder;

        let workOrder: any = {
            WorkOrderId: null, //await Sequence.Next(seqKey),
            Orderid: patientOrder.Id,
            Patientid: patientOrder.PatientId,
            ParentPatientId: patientOrder.ParentPatientId,
            SubCategoryId: patientOrder.SubCategoryId,
            StartTime: patientOrder.StartTime,
            OrderCompletedDate: patientOrder.OrderCompletedDate,
            NoofDays: patientOrder.NoofDays,
            MinAdvance: patientOrder.MinAdvance,
            EndTime: patientOrder.EndTime,
            Encounterid: patientOrder.EncounterId,
            Orderedbyid: patientOrder.CreatedBy,
            Orderedbyname: patientOrder.DoctorName,
            WorkOrderStatusId: 1,
            Ordereddate: patientOrder.OrderRequestDate,
            OrderPriorityId: patientOrder.OrderPriorityId,
            TestTypeId: patientOrder.TestTypeId,
            Departmentid: patientOrder.OrderToId,
            FacilityId: patientOrder.FacilityId,
            PatientName: patientOrder.PatientName,
            PatientMrn: patientOrder.PatientMRN,
            PatientMobile: patientOrder.PatientMobile,
            IsLabOrders: patientOrder.IsLabOrders,
            IsVaccineOrders: patientOrder.IsVaccineOrders,
            IsOxygenOrders: patientOrder.IsOxygenOrders,
            ResultFormatTypeId: patientOrder.ResultFormatTypeId,
            VirtualOrderId: patientOrder.VirtualOrderId,
            IsVirtualOrders: true,
        };
        let result = await this.Save(workOrder);
        console.log(result, 'Error check******');
        let woId = result.dataValues.Id;
        try {
            this.deferSequenceKey(woId, 'WorkOrderId',
                this.getSequenceIdentifier(seqKey));
        } catch (error) {
            throw { message: 'Sequence Issue.. Please contact Support' };
        }

        for (let jdx in req.Data.selectedlist) {
            let orddetail = req.Data.selectedlist[jdx];
            let wdetail: any = {
                Id: 0,
                Workorderid: woId,
                Orderid: orddetail.PatientOrderId,
                Orderdetailid: orddetail.Id,
                PatientId: orddetail.PatientId,
                IsVirtualOrders: true,
                ServiceId: orddetail.ServiceId,
                ServiceCode: orddetail.ServiceCode,
                ServiceName: orddetail.ServiceName,
                Testid: orddetail.TestId,
                Testname: orddetail.TestName,
                AcceptedDate: new Date()
            };
            let woDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            await woDetailBO.Save(wdetail);
        }

        let wOSampleBO = BoFactory.GetBo(lisbo.WorkOrderSampleBo, this.Request);
        await wOSampleBO.CreateWorkOrderSampleFromWorkOrder(woId, ids);
        // await this.sendApprovalSMS(req, req.Id);

        for (let dtidx in req.Data.selectedlist) {
            let ord: any = { 'OrderStatusId': 10 }; // Accepted
            await PatientOrderDetailBo.Update(ord, {
                fields: ['OrderStatusId'],
                where: { 'Id': req.Data.selectedlist[dtidx].Id },
            });
        }
        return true;
    }

    public async AcceptOrder(req: BaseRequest): Promise<boolean> {
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let BillDetailBO = BoFactory.GetBo(billBo.PatientBillDetailsBo, this.Request);
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        // let patientOrder: any = await PatientOrderBo.GetPatientOrderById({ Id: req.Id });
        let patientOrder: any = await PatientOrderBo.GetMinPatientOrderById({ Id: req.Id });

        if (req.Data.selectedlist) {

            let WKOrdSepSubDept = 0;
            let WKOrdSepTestLevel = 0;
            let WOrdCulturelevel = 0;
            let printPreferencesData =
                await facilityprebo.GetPrintPreferences('billing',
                    null, this.Session.FacilityId);
            if (printPreferencesData && printPreferencesData.orderseparatebysubdept) {
                try {
                    WKOrdSepSubDept = parseInt(printPreferencesData.orderseparatebysubdept);
                } catch (ex) { WKOrdSepSubDept = 0; }
            }
            let directBill = false;
            for (let i = 0; i < req.Data.selectedlist.length; i++) {
                var itemlist = req.Data.selectedlist[i];
                if (itemlist.IsDirectBill) {
                    directBill = true;
                }
                if (itemlist.IsSeparateWorkOrder) {
                    WKOrdSepTestLevel = 1;
                }
                if (itemlist.IsCulture) {
                    WOrdCulturelevel = 1;
                }
            }

            let groupedData: any;
            if (WKOrdSepSubDept && WKOrdSepTestLevel) {
                groupedData =
                    this.groupByMulti(req.Data.selectedlist, ['SubDepartmentId', 'IsSeparateWorkOrder', 'ExternalProviderId'], []);
            } else if (WKOrdSepSubDept && !WKOrdSepTestLevel) {
                groupedData =
                    this.groupByMulti(req.Data.selectedlist, ['SubDepartmentId', 'ExternalProviderId'], []);
            } else if (!WKOrdSepSubDept && WKOrdSepTestLevel) {
                groupedData =
                    this.groupByMulti(req.Data.selectedlist, ['IsSeparateWorkOrder', 'ExternalProviderId'], []);
            } else if (!WKOrdSepSubDept && !WKOrdSepTestLevel) {
                groupedData = _.groupBy(req.Data.selectedlist, 'ExternalProviderId');
            } else {
                groupedData = _.groupBy(req.Data.selectedlist, 'ExternalProviderId');
            }
            if (WOrdCulturelevel) {
                groupedData = _.groupBy(req.Data.selectedlist, 'IsCulture');
            }
            if (WOrdCulturelevel && WKOrdSepSubDept) {
                groupedData =
                    this.groupByMulti(req.Data.selectedlist, ['SubDepartmentId', 'IsCulture'], []);
            }
            let keys = _.keys(groupedData);
            for (let idx in keys) {
                let key = keys[idx];
                let details = groupedData[key];
                let iSubdeptId = 0;
                let isculture = false;
                let ids = [];
                key = null;
                for (var jdx in details) {
                    let detail: any = details[jdx];
                    if (detail.ExternalProviderId)
                        key = detail.ExternalProviderId;
                    ids.push(detail.Id);
                    iSubdeptId = detail.SubDepartmentId;
                    isculture = detail.IsCulture;
                }

                //Work order creation
                let woId: number;
                // // let owoId: number;
                // let isculture = false;
                // if (WOrdCulturelevel > 0) {isculture = true;
                // for (let i = 1; i <= 3; i++) {
                //     if (i === 1) {
                // woId = await this.CreateWorkOrderFromOrder(req.Id, ids, patientOrder, key, WKOrdSepSubDept, iSubdeptId,
                //     null, isculture);
                //     } else {
                //         owoId = await this.CreateWorkOrderFromOrder(req.Id, ids, patientOrder, key, WKOrdSepSubDept, iSubdeptId,
                //             woId, isculture);
                //     }
                // }
                // } else {
                // isculture = false;
                woId = await this.CreateWorkOrderFromOrder(req.Id, ids, patientOrder, key, WKOrdSepSubDept, iSubdeptId,
                    null, isculture);
                // }

                //Work order sample creation - only for LIS
                if (patientOrder.TestTypeId === 1) {
                    let wOSampleBO = BoFactory.GetBo(lisbo.WorkOrderSampleBo, this.Request);
                    await wOSampleBO.CreateWorkOrderSampleFromWorkOrder(woId, ids);
                }
                if (patientOrder.EncounterTypeId === 2 || patientOrder.EncounterTypeId === 5) {
                    let fromward = false;
                    // if (req.Data.Header.EncounterTypeId === 2 && withDirectBill === 1) {
                    //     await this.ManageIPDirectBill(req, patientOrderId);
                    // }
                    let DocShareDetails: any = [];
                    let PatientBillId = await BillBO.ManageIPOrderPatientBills(req.Id, ids, patientOrder, fromward, false, 10,
                        DocShareDetails);
                    if (PatientBillId) {
                        let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
                        patientOrder.BillingId = PatientBillData.Id;
                        patientOrder.OrderStatusId = 10; // OrderStatus <- Accepted
                        if (patientOrder.BillNumber === null) {
                            patientOrder.BillNumber = PatientBillData.BillNumber;
                        } else {
                            let ordBillnumber = patientOrder.BillNumber;
                            if (ordBillnumber.indexOf(PatientBillData.BillNumber) === -1)
                                patientOrder.BillNumber += ' ,' + PatientBillData.BillNumber;
                        }
                        await PatientOrderBo.Update(patientOrder);
                    }
                }
                if ((printPreferencesData && printPreferencesData.skiplisorderassgingment)
                    || (printPreferencesData.skiprisorderassgingment)
                    || (printPreferencesData.skipambulatoryorderassgingment)
                    || (printPreferencesData.skipendoscopyorderassgingment)) {
                    await this.SkipOrderAssignProcess(woId, patientOrder, printPreferencesData);
                }

            }
            PatientOrderDetailBo.UpdateExternalProviderDetails(req.Data.selectedlist);

            for (let dtidx in req.Data.selectedlist) {
                let ord: any = { 'OrderStatusId': 10 }; // Accepted
                await BillDetailBO.Update(ord, {
                    fields: ['OrderStatusId'],
                    where: { 'Id': req.Data.selectedlist[dtidx].PatientBillDetailId },
                });
            }

            let LABPatientOrderTotalCount = await PatientOrderDetailBo.Items.count({
                where: {
                    'Status': 1,
                    'PatientOrderId': patientOrder.Id
                    // 'TestTypeId': req.Data.Testtypeid,
                    // 'OrderStatusId': 10 //{ '$in': [1,10] }, Accepted
                    // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });

            let orderstatus = 10;
            let LABPatientOrderACKCount = await PatientOrderDetailBo.Items.count({
                where: {
                    'Status': 1,
                    'PatientOrderId': patientOrder.Id,
                    // 'TestTypeId': req.Data.Testtypeid,
                    'OrderStatusId': 10 //{ '$in': [1,10] }, Accepted
                    // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });

            if (LABPatientOrderTotalCount && LABPatientOrderTotalCount >= 0) {
                if (LABPatientOrderACKCount && LABPatientOrderACKCount >= 0) {
                    if (LABPatientOrderTotalCount !== LABPatientOrderACKCount) {
                        orderstatus = 17;
                    }
                }
            }
            let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
            let ord: any = { 'OrderStatusId': orderstatus }; //Accepted
            await patientOBO.Update(ord, {
                fields: ['OrderStatusId'],
                where: { 'Id': patientOrder.Id },
            });

        }
        return true;
    }

    public async updateOrderStatus(req: BaseRequest): Promise<any> {
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let OId: any = req.Id;
        // let patientOrder: any = await PatientOrderBo.GetPatientOrderById({ Id: req.Id });
        let LABPatientOrderTotalCount = await PatientOrderDetailBo.Items.count({
            where: {
                'Status': 1,
                'PatientOrderId': OId
                // 'TestTypeId': req.Data.Testtypeid,
                // 'OrderStatusId': 10 //{ '$in': [1,10] }, Accepted
                // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        });
        let orderstatus = 10;
        let LABPatientOrderACKCount = await PatientOrderDetailBo.Items.count({
            where: {
                'Status': 1,
                'PatientOrderId': OId,
                // 'TestTypeId': req.Data.Testtypeid,
                'OrderStatusId': 10 //{ '$in': [1,10] }, Accepted
                // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        });

        if (LABPatientOrderTotalCount && LABPatientOrderTotalCount >= 0) {
            if (LABPatientOrderACKCount && LABPatientOrderACKCount >= 0) {
                if (LABPatientOrderTotalCount !== LABPatientOrderACKCount) {
                    orderstatus = 17;
                }
            }
        }
        let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let ord: any = { 'OrderStatusId': orderstatus }; //Accepted
        await patientOBO.Update(ord, {
            fields: ['OrderStatusId'],
            where: { 'Id': OId },
        });
        return true;
    }

    public async SkipOrderAssignProcess(woId: number, patientOrder: any,
        printPreferencesData: any): Promise<boolean> {
        let skiplisorderassign = 0;
        let skiprisorderassign = 0;
        let skipambuorderassign = 0;
        let skipendoorderassign = 0;

        if (printPreferencesData && printPreferencesData.skiplisorderassgingment) {
            try {
                skiplisorderassign = parseInt(printPreferencesData.skiplisorderassgingment);
            } catch (ex) { skiplisorderassign = 0; }
        }

        if (printPreferencesData && printPreferencesData.skiprisorderassgingment) {
            try {
                skiprisorderassign = parseInt(printPreferencesData.skiprisorderassgingment);
            } catch (ex) { skiprisorderassign = 0; }
        }

        if (printPreferencesData && printPreferencesData.skipambulatoryorderassgingment) {
            try {
                skipambuorderassign = parseInt(printPreferencesData.skipambulatoryorderassgingment);
            } catch (ex) { skipambuorderassign = 0; }
        }

        if (printPreferencesData && printPreferencesData.skipendoscopyorderassgingment) {
            try {
                skipendoorderassign = parseInt(printPreferencesData.skipendoscopyorderassgingment);
            } catch (ex) { skipendoorderassign = 0; }
        }


        if (skiplisorderassign || skiprisorderassign
            || skipambuorderassign || skipendoorderassign) {

            let workOrder = null;
            let workOrderInstance = await this.GetById(woId);
            if (workOrderInstance) {
                workOrder = this.GetAttribute(workOrderInstance);
                workOrder.UserId = this.Session.UserId;
            }
            if (workOrder && workOrder.Id) {
                let ReqOrdAssign = {
                    Id: woId,
                    Data: workOrder
                };
                if (patientOrder && patientOrder.TestTypeId === 1 && skiplisorderassign) {
                    await this.AssignOrder(ReqOrdAssign);
                } else if (patientOrder && patientOrder.TestTypeId === 2 && skiprisorderassign) {
                    await this.AssignOrder(ReqOrdAssign);
                } else if (patientOrder && patientOrder.TestTypeId === 3 && skipambuorderassign) {
                    await this.AssignOrder(ReqOrdAssign);
                } else if (patientOrder && patientOrder.TestTypeId === 4 && skipendoorderassign) {
                    await this.AssignOrder(ReqOrdAssign);
                }
            }
        }
        return true;
    }

    public async AssignOrder(req: BaseRequest): Promise<boolean> {
        let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);

        let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
        let orderId = req.Data.Orderid;
        let ordertat: any = { 'AssignedOn': new Date(), WorkOrderId: req.Id };
        await orderTATBO.UpdateAssignedDate(orderId, ordertat);

        req.Data.WorkOrderStatusId = 2; //ASSIGNED & IN-PROGRESS
        req.Data.Assigndate = new Date();
        await this.Update(req.Data);

        let ord: any = { 'OrderStatusId': 6 }; //InProcess
        await patientOBO.Update(ord, {
            fields: ['OrderStatusId'],
            where: { 'Id': orderId },
        });

        return true;
    }

    public async AssignOrderById(req: BaseRequest): Promise<boolean> {
        let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);

        let workOrderInstance = await this.GetById(req.Id);
        if (workOrderInstance) {
            let workOrder = this.GetAttribute(workOrderInstance);

            workOrder.WorkOrderStatusId = 2; //ASSIGNED & IN-PROGRESS
            workOrder.UserId = this.Session.UserId;
            workOrder.LabAssignTypeId = 1; //Inhouse
            workOrder.Assigndate = new Date();
            await this.Update(workOrder);

            let orderId = workOrder.Orderid;
            let ord: any = { 'OrderStatusId': 6 }; //InProcess
            await patientOBO.Update(ord, {
                fields: ['OrderStatusId'],
                where: { 'Id': orderId },
            });
        }

        return true;
    }

    public async CancelBillOrder(req: any): Promise<boolean> {
        let BillDetailBO = BoFactory.GetBo(billBo.PatientBillDetailsBo, this.Request);

        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        // let PatientBillsData = await PatientBillsBo.GetPatientBillsById({ Id: req.BillId });

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: req.BillId }]
        };
        let PatientBillDetailData = await BillDetailBO.GetPatientBillDetails(apiReq);
        let DetailLength = PatientBillDetailData.Data.length;
        if (PatientBillDetailData.Data.length > 0) {
            let cancelLength = 0;
            for (let dx in PatientBillDetailData.Data) {
                let BillDetailData = PatientBillDetailData.Data[dx];
                if (BillDetailData.PatientBillStatusId === 2) {
                    cancelLength++;
                }
            }
            if (DetailLength === cancelLength) {
                let BillUpdate: any = {
                    Id: req.BillId,
                    PatientBillStatusId: 2
                };
                await PatientBillsBo.Update(BillUpdate);
            }
        }
        return true;
    }

    public async CancelOrder(req: BaseRequest): Promise<boolean> {
        let patientOrderBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let patientODBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let BillDetailBO = BoFactory.GetBo(billBo.PatientBillDetailsBo, this.Request);

        let orderDetails = await patientODBO.GetPatientOrderDetailsFromOrderId(req.Id, req.Data.detailids);
        if (orderDetails.Data.length > 0) {
            await Promise.all(orderDetails.Data.map((orderdetail): Promise<void> => {
                return (async (od): Promise<void> => {
                    let ods: any = { 'OrderStatusId': 2 }; //2 - Cancelled
                    await patientODBO.Update(ods, {
                        fields: ['OrderStatusId'],
                        where: { 'Id': od.Id },
                    });
                })(orderdetail);
            }));
            let BillId: number = 0;
            for (let dtidx in orderDetails.Data) {
                BillId = orderDetails.Data[0].PatientBillId;
                let ord: any = { 'OrderStatusId': 2, 'PatientBillStatusId': 2 }; // Cancelled
                await BillDetailBO.Update(ord, {
                    fields: ['OrderStatusId'],
                    where: { 'Id': orderDetails.Data[dtidx].PatientBillDetailId },
                });
            }
            // let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
            // let PatientBillsData = await PatientBillsBo.GetPatientBillById({ Id: BillId });

            // let apiReq = {
            //     Id: 0,
            //     PageContext: { PageSize: -1, PageNumber: 1 },
            //     Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBillsData.Id }]
            // };
            // let PatientBillDetailData = await BillDetailBO.GetPatientBillDetails(apiReq);

            //Call patientorderbo to update status
            if (req.Data.orderstatusid) {
                await patientOrderBO.UpdateOrderStatus(req.Id, req.Data.orderstatusid);
            }
        }
        return true;
    }

    public async GetDeptSeqName(SubDeptId: number): Promise<string> {
        let SubDeptIdentifier = null;
        if (SubDeptId > 0) {
            let deptbo = BoFactory.GetBo(appbo.DepartmentBo, this.Request);
            let DeptInfo = await deptbo.GetDepartmentById({ Id: SubDeptId });
            if (DeptInfo && DeptInfo.DeptSeqName) {
                SubDeptIdentifier = DeptInfo.DeptSeqName;
            }
        }
        return SubDeptIdentifier;
    }

    public async CreateWorkOrderFromOrder(orderId: number, detailIds: any, order: any, externalProviderId: any,
        WKOrdSepSubDept: number, iSubdeptId: number, parentId: number, isculture: boolean): Promise<number> {
        // let patientOBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let seqKey: string = (order.TestTypeId === 1) ? SequenceKeys.PatientLISWorkOrder
            : (order.TestTypeId === 2) ? SequenceKeys.PatientRISWorkOrder
                : (order.TestTypeId === 4) ? SequenceKeys.PatientENDOWorkOrder
                    : SequenceKeys.PatientAMBWorkOrder;
        if (WKOrdSepSubDept && iSubdeptId) {
            let SubDeptIdentifier = await this.GetDeptSeqName(iSubdeptId);
            if (SubDeptIdentifier) {
                let isRedisPresent = await SequenceGenerator.GetSequence(this.getSequenceIdentifier(SubDeptIdentifier));
                if (isRedisPresent) {
                    seqKey = SubDeptIdentifier;
                }
            }
        }
        externalProviderId = externalProviderId === null || externalProviderId === 'null' ? null : externalProviderId;
        let labAssignTypeId = externalProviderId !== null ? 2 : 1; //2 - external, 1 - internal


        if (this.Session.FacilityId && (!order.FacilityId || order.FacilityId === -1))
            order.FacilityId = this.Session.FacilityId;

        let workOrder: any = {
            WorkOrderId: null, //await Sequence.Next(seqKey),
            Orderid: order.Id,
            Patientid: order.PatientId,
            Encounterid: order.EncounterId,
            ConsultationId: order.ConsultationId,
            Orderedbyid: order.DoctorId,
            Orderedbyname: order.DoctorName,
            WorkOrderStatusId: 1, //Created
            Ordereddate: order.OrderRequestDate,
            ExternalProviderId: externalProviderId,
            OrderPriorityId: order.OrderPriorityId,
            TestTypeId: order.TestTypeId,
            Departmentid: order.OrderToId,
            Subdepartmentid: WKOrdSepSubDept ? iSubdeptId : order.SubDepartmentId,
            LabAssignTypeId: labAssignTypeId,
            FacilityId: order.FacilityId,
            PatientName: order.PatientName,
            PatientMrn: order.PatientMRN,
            PatientMobile: order.PatientMobile,
            ResultFormatTypeId: order.ResultFormatTypeId,
            IsVirtualOrders: order.IsVirtualOrders,
            SubCategoryId: order.SubCategoryId,
            StartTime: order.StartTime,
            EndTime: order.EndTime,
            IsLabOrders: order.IsLabOrders,
            IsExternalLab: order.IsExternalLab,
            ExternalOrderStatusId: order.ExternalOrderStatusId,
            ParentWorkOrderId: parentId,
            IsCulture: isculture
            //UserId: this.Session.UserId
            //Departmentid: TODO while group save that id
            //Subdepartmentid: TODO while group save that id
            //DepartmentrefNo: TODO while group save that id
            //WorkorderStatus: TODO introduce new status
        };

        let result = await this.Save(workOrder);
        let woId = result.dataValues.Id;
        try {
            this.deferSequenceKey(woId, 'WorkOrderId',
                this.getSequenceIdentifier(seqKey));
        } catch (error) {
            throw { message: 'Sequence Issue.. Please contact Support' };
        }

        let woDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        await woDetailBO.CreateWorkOrderFromOrderDetails(woId, orderId, order.EncounterId, detailIds);

        // let ord: any = { 'OrderStatusId': 10 }; //Accepted
        // await patientOBO.Update(ord, {
        //     fields: ['OrderStatusId'],
        //     where: { 'Id': order.Id },
        // });
        return woId;
    }

    public async PrintPatientWorkorderArray(req: BaseRequest, IsSave?: boolean): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Orderid, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let HeaderInfo = req.Data.HeaderInfo;
        let PackageName = req.Data.PackageName;
        // let IsProvisional = false;
        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];
        let PatientWorkorderDetailData: any;
        if (req.Data && req.Data.selectedtests && (!req.Data.isfrom || req.Data.isfrom !== 'resultdispatch')) {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        }

        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData: any = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        let Age = '';
        if (patientData.Age === 0) {
            let diffDuration = moment.duration(moment().diff(patientData.DOB));
            let ageresult = '';
            let years = diffDuration.years();
            let months = diffDuration.months();
            let days = diffDuration.days();
            if (years > 0) {
                ageresult = diffDuration.years() + 'y ';
            } else if (years === 0) {
                if (months > 0) {
                    ageresult += diffDuration.months() + 'M ';
                }
                if (days > 0) {
                    ageresult += diffDuration.days() + 'D ';
                }
            }
            Age = ageresult;
        } else if (patientData.Age > 0) {
            Age = patientData.Age + 'y';
        }

        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        let PatientWorkorderDetail = [];
        let Sampleid = '';
        let AttachmentImgs = [];
        if (req.Data.isfrom === 'resultdispatch') {
            for (let bdx in data.Data) {
                let workorder = data.Data[bdx];
                let Req = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: workorder.Id },
                    { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                    { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
                };
                Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
                let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
                PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
                if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
                    Sampleid = '';
                    AttachmentImgs = [];
                    // PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                    //     ['TestPrintOrder', 'AnalytePrintOrder'],
                    //     ['asc', 'asc']);
                    if (this.Session.IsDeptWiseLabPrint) {
                        PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data, ['SubdeptDisplayOrder',
                            'TestPrintOrder',
                            'AnalytePrintOrder'],
                            ['asc', 'asc', 'asc']);
                    } else {
                        PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                            ['TestPrintOrder', 'AnalytePrintOrder'],
                            ['asc', 'asc']);
                    }
                }

                let apiReqAtt = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: workorder.Id }]
                };
                let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
                let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
                let attachments: any = attachData.Data;

                //console.log('attachments');
                //console.log(attachments);


                let AttachmentImgGroups: any = {};
                if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
                    for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
                        let item: any;
                        item = PatientWorkorderDetailData.Data[i];
                        if (item.PatientOrderDetail.Testmaster) {
                            if (item.PatientOrderDetail.Testmaster.IsNABLTest) {
                                item.IsNABLTest = item.PatientOrderDetail.Testmaster.IsNABLTest;
                            }
                        }
                        if (item.RootProfileName) {
                            if (item.IsNABLTest) {
                                item.RootProfileName = item.RootProfileName + '**';
                            }
                        }
                        if (!item.RootProfileName) {
                            if (item.IsNABLTest) {
                                item.Testname = item.Testname + '**';
                            }
                        }
                        if (item.Resultvalue && item.TestValueType === '1') {
                            item.Resultvalue =
                                item.Resultvalue.replace(/\n/g, '<br />');
                        }
                        item.IsWrapResult = false;
                        if (item.Analyte) {
                            item.IsWrapResult = item.Analyte.IsWrapResult;
                        }
                        for (let k = 0; k < attachments.length; k++) {
                            let attitem = attachments[k];
                            if (item.Id === attitem.WorkOrderDetailId) {
                                item.FilePath = attitem.FilePath;
                                if (item.FilePath) {
                                    try {
                                        let fileBuff = await readFileSync(item.FilePath);
                                        let Thumbnail = new Buffer(fileBuff).toString('base64');
                                        item.Thumbnail = Thumbnail;
                                    } catch (ex) {
                                        item.FilePath = null;
                                        item.Thumbnail = null;
                                    }
                                }
                            }
                            if (!attitem.WorkOrderDetailId) {
                                if (!AttachmentImgGroups[attitem.Id]) {
                                    AttachmentImgGroups[attitem.Id] = attitem.Id;
                                    AttachmentImgs.push(attitem);
                                }
                            }
                        }
                        if (Sampleid.indexOf(item.Sampleid) < 0) {
                            if (Sampleid.length === 0) Sampleid += item.Sampleid;
                            else Sampleid += ',' + item.Sampleid;
                        }
                        if (!item.FilePath) {
                            item.FilePath = null;
                            item.Thumbnail = null;
                        }
                        PatientWorkorderDetail.push(item);
                    }
                }
            }
        }
        let EReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientWorkorders.EncounterId }]
        };
        let EncounterBo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
        let EncounterData = await EncounterBo.GetEncounters(EReq);
        let EncounterValue = EncounterData.Data[0];
        let RReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferralFilters.Id, Value: EncounterValue.ReferralId }
            ]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let ReferralData = await ReferralBo.GetReferrals(RReq);
        let ReferralValue = ReferralData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];
        let showApprovedBy: any = null;
        if (PatientWorkorders.WorkOrderStatusId === 7 ||
            PatientWorkorders.WorkOrderStatusId === 8 ||
            PatientWorkorders.WorkOrderStatusId === 9) {
            showApprovedBy = 'Approved';
        } else {
            showApprovedBy = null;
        }

        let info = {
            text: '',
            Title: '',
            HeaderInfo: HeaderInfo,
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetail,
            Sampleid: Sampleid,
            Age: Age,
            Patient: patientData,
            Attachments: AttachmentImgs,
            EncounterValue: EncounterValue,
            ReferralValue: ReferralValue,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData,
            showApprovedBy: showApprovedBy,
            PackageName: PackageName,
            url: 'http%3A%2F%2Fuatmetrokathmanduhospital.awt.cloud%2F%23%2Fselflabprintcertificate%2F' + req.Id
        };

        let key = 'externallab';
        /*if (req.Data && req.Data.IsDepartment) {
            key = 'labbydept';
        }*/
        if (info.PatientWorkorder.TestTypeId === 2) {
            key = 'radiologylabresult';
        }
        console.log('key');
        console.log(key);
        if (PatientWorkorders.WorkOrderStatusId !== 7) {
            info.text = '* This is a Intermediate  Print Hence Need Approval';
            info.Title = 'LAB REPORT';
        } else {
            info.Title = 'LAB REPORT';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientWorkorder.WorkOrderStatusId === 4 || info.PatientWorkorder.WorkOrderStatusId === 5) {
            Watermark = 'PROVISIONAL';
            PrintTypeId = 2;
        }
        let printInfo = {
            ObjectId: req.Id
            , ObjectTypeId: 4 /*Order*/
            , Reason: req.Data ? req.Data.Reason : null
            , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
            , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        };
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
        if ((printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2)) {
            Watermark = Watermark || '';
        }
        pdfOption = JSON.parse(pdfOptionJSON);
        pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        if (IsSave && IsSave === true) {
            let filename = patientData.MRN + PatientWorkorders.Id + '.pdf';
            return await Report.GeneratePdf(key, { header: {}, body: info, watermark: Watermark }, filename, null, pdfOption);
        } else {
            return await Report.Generate(key, { header: {}, body: info, watermark: Watermark }, null, pdfOption);
        }

        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info, pdfOption }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintPatientWorkorder(req: BaseRequest, IsSave?: boolean): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let HeaderInfo = req.Data.HeaderInfo;
        let PackageName = req.Data.PackageName;
        // let IsProvisional = false;
        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];
        let PatientWorkorderDetailData: any;
        if (req.Data && req.Data.selectedtests && (!req.Data.isfrom || req.Data.isfrom !== 'resultdispatch')) {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        }
        if (req.Data.isfrom === 'resultdispatch') {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        }
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData: any = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        let Age = '';
        if (patientData.Age === 0) {
            let diffDuration = moment.duration(moment().diff(patientData.DOB));
            let ageresult = '';
            let years = diffDuration.years();
            let months = diffDuration.months();
            let days = diffDuration.days();
            if (years > 0) {
                ageresult = diffDuration.years() + 'y ';
            } else if (years === 0) {
                if (months > 0) {
                    ageresult += diffDuration.months() + 'M ';
                }
                if (days > 0) {
                    ageresult += diffDuration.days() + 'D ';
                }
            }
            Age = ageresult;
        } else if (patientData.Age > 0) {
            Age = patientData.Age + 'y';
        }
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            // PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
            //     ['TestPrintOrder', 'AnalytePrintOrder'],
            //     ['asc', 'asc']);
            if (this.Session.IsDeptWiseLabPrint) {
                PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data, ['SubdeptDisplayOrder', 'TestPrintOrder',
                    'AnalytePrintOrder'], ['asc', 'asc', 'asc']);
            } else {
                PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                    ['TestPrintOrder', 'AnalytePrintOrder'],
                    ['asc', 'asc']);
            }
        }

        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        //console.log('attachments');
        //console.log(attachments);
        let PatientWorkorderDetail = [];
        let Sampleid = '';
        let AttachmentImgs = [];
        let AttachmentImgGroups: any = {};
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
                let item: any;
                item = PatientWorkorderDetailData.Data[i];
                if (item.PatientOrderDetail.Testmaster) {
                    if (item.PatientOrderDetail.Testmaster.IsNABLTest) {
                        item.IsNABLTest = item.PatientOrderDetail.Testmaster.IsNABLTest;
                    }
                }
                if (item.RootProfileName) {
                    if (item.IsNABLTest) {
                        item.RootProfileName = item.RootProfileName + '**';
                    }
                }
                if (!item.RootProfileName) {
                    if (item.IsNABLTest) {
                        item.Testname = item.Testname + '**';
                    }
                }
                if (item.Resultvalue && item.TestValueType === '1') {
                    item.Resultvalue =
                        item.Resultvalue.replace(/\n/g, '<br />');
                }
                item.IsWrapResult = false;
                if (item.Analyte) {
                    item.IsWrapResult = item.Analyte.IsWrapResult;
                }
                for (let k = 0; k < attachments.length; k++) {
                    let attitem = attachments[k];
                    if (item.Id === attitem.WorkOrderDetailId) {
                        item.FilePath = attitem.FilePath;
                        if (item.FilePath) {
                            try {
                                let fileBuff = await readFileSync(item.FilePath);
                                let Thumbnail = new Buffer(fileBuff).toString('base64');
                                item.Thumbnail = Thumbnail;
                            } catch (ex) {
                                item.FilePath = null;
                                item.Thumbnail = null;
                            }
                        }
                    }
                    if (!attitem.WorkOrderDetailId) {
                        if (!AttachmentImgGroups[attitem.Id]) {
                            AttachmentImgGroups[attitem.Id] = attitem.Id;
                            AttachmentImgs.push(attitem);
                        }
                    }
                }
                if (Sampleid.indexOf(item.Sampleid) < 0) {
                    if (Sampleid.length === 0) Sampleid += item.Sampleid;
                    else Sampleid += ',' + item.Sampleid;
                }
                if (!item.FilePath) {
                    item.FilePath = null;
                    item.Thumbnail = null;
                }
                PatientWorkorderDetail.push(item);
            }
        }
        let EReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientWorkorders.EncounterId }]
        };
        let EncounterBo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
        let EncounterData = await EncounterBo.GetEncounters(EReq);
        let EncounterValue = EncounterData.Data[0];
        let RReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferralFilters.Id, Value: EncounterValue.ReferralId }
            ]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let ReferralData = await ReferralBo.GetReferrals(RReq);
        let ReferralValue = ReferralData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];
        let showApprovedBy: any = null;
        if (PatientWorkorders.WorkOrderStatusId === 7 ||
            PatientWorkorders.WorkOrderStatusId === 8 ||
            PatientWorkorders.WorkOrderStatusId === 9) {
            showApprovedBy = 'Approved';
        } else {
            showApprovedBy = null;
        }

        let info = {
            text: '',
            Title: '',
            HeaderInfo: HeaderInfo,
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetail,
            Sampleid: Sampleid,
            Age: Age,
            Patient: patientData,
            Attachments: AttachmentImgs,
            EncounterValue: EncounterValue,
            ReferralValue: ReferralValue,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData,
            showApprovedBy: showApprovedBy,
            PackageName: PackageName,
            url: 'http%3A%2F%2Fuatmetrokathmanduhospital.awt.cloud%2F%23%2Fselflabprintcertificate%2F' + req.Id
        };

        let key = 'externallab';
        /*if (req.Data && req.Data.IsDepartment) {
            key = 'labbydept';
        }*/
        if (info.PatientWorkorder.TestTypeId === 2) {
            key = 'radiologylabresult';
        }
        console.log('key');
        console.log(key);
        if (PatientWorkorders.WorkOrderStatusId !== 7) {
            info.text = '* This is a Intermediate  Print Hence Need Approval';
            info.Title = 'LAB REPORT';
        } else {
            info.Title = 'LAB REPORT';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientWorkorder.WorkOrderStatusId === 4 || info.PatientWorkorder.WorkOrderStatusId === 5) {
            Watermark = 'PROVISIONAL';
            PrintTypeId = 2;
        }
        let printInfo = {
            ObjectId: req.Id
            , ObjectTypeId: 4 /*Order*/
            , Reason: req.Data ? req.Data.Reason : null
            , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
            , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        };
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
        if ((printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2)) {
            Watermark = Watermark || '';
        }
        pdfOption = JSON.parse(pdfOptionJSON);
        pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        if (IsSave && IsSave === true) {
            let filename = patientData.MRN + PatientWorkorders.Id + '.pdf';
            return await Report.GeneratePdf(key, { header: {}, body: info, watermark: Watermark }, filename, null, pdfOption);
        } else {
            return await Report.Generate(key, { header: {}, body: info, watermark: Watermark }, null, pdfOption);
        }

        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info, pdfOption }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }
    public async PrintExternallabSlip(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }
            ]
        };
        let patientoDetBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let ordReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: PatientWorkorders.Orderid }
            ]
        };
        let PatientorderDetaildata = await patientoDetBO.GetPatientOrderDetails(ordReq);


        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });


        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            if (PatientWorkorderDetailData.Data[i].Resultvalue &&
                PatientWorkorderDetailData.Data[i].TestValueType === '1') {
                PatientWorkorderDetailData.Data[i].Resultvalue =
                    PatientWorkorderDetailData.Data[i].Resultvalue.replace(/\n/g, '<br />');
            }
        }
        /////console.log('attachments');
        /////console.log(attachments);
        let info = {
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetailData.Data,
            PatientorderDetails: PatientorderDetaildata.Data,
            Patient: patientData,
            Attachments: attachments,
            Preferences: printPreferencesData
        };

        let key = 'externallabslip';
        let pdfOption: any = null;

        // pdfOption = {
        //     format: 'A5',
        //     orientation: 'portrait',
        //     border: '0',
        //     header: {
        //         height: '1in',
        //         contents: '',
        //     },
        //     footer: {
        //         height: '1in',
        //         contents: {
        //             first: '',
        //             default: '',
        //             last: '',
        //         },
        //     },
        //     type: 'pdf',
        //     base: 'file://' + join(__dirname, '/../../Templates/assets/')
        // };
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A5',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPatientWorkorderWithoutheader(req: BaseRequest, IsSave?: boolean): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let PackageName = req.Data.PackageName;

        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        // let PatientOrderData = await PatientOrderBo.GetMinPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];
        let PatientWorkorderDetailData: any;
        if (req.Data && req.Data.selectedtests && (!req.Data.isfrom || req.Data.isfrom !== 'resultdispatch')) {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
            // PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetMinPatientWorkorderdetailss(Req);
        }
        if (req.Data.isfrom === 'resultdispatch') {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        }
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        // let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        let Age = '';
        let patReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: PatientOrder.PatientId }]
        };
        let patientinfo = await patientBo.GetMinPatientSearch(patReq);
        let patientData: any = {};
        patientData = patientinfo.Data[0];

        if (patientData.Age === 0) {
            let diffDuration = moment.duration(moment().diff(patientData.DOB));
            let ageresult = '';
            let years = diffDuration.years();
            let months = diffDuration.months();
            let days = diffDuration.days();
            if (years > 0) {
                ageresult = diffDuration.years() + 'y ';
            } else if (years === 0) {
                if (months > 0) {
                    ageresult += diffDuration.months() + 'M ';
                }
                if (days > 0) {
                    ageresult += diffDuration.days() + 'D ';
                }
            }
            Age = ageresult;
        } else if (patientData.Age > 0) {
            Age = patientData.Age + 'y';
        }
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            // PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
            //     ['TestPrintOrder', 'AnalytePrintOrder'],
            //     ['asc', 'asc']);
            if (this.Session.IsDeptWiseLabPrint) {
                PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data, ['SubdeptDisplayOrder', 'TestPrintOrder',
                    'AnalytePrintOrder'], ['asc', 'asc', 'asc']);
            } else {
                PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                    ['TestPrintOrder', 'AnalytePrintOrder'],
                    ['asc', 'asc']);
            }
        }

        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        //console.log('attachments');
        //console.log(attachments);
        let PatientWorkorderDetail = [];
        let Sampleid = '';
        let AttachmentImgs = [];
        let AttachmentImgGroups: any = {};
        let selectedItems: any = {};
        if (req.Data.selectedArray) {
            selectedItems = req.Data.selectedArray;
        }
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
                let item: any;
                item = PatientWorkorderDetailData.Data[i];
                item.IsPrint = 'no';
                let analayteItems = [];
                console.log('*********Analy********');
                console.log(selectedItems);
                // console.log(item);
                console.log(item.Testid);
                console.log(selectedItems[item.Testid]);
                if (selectedItems && selectedItems[item.Testid]) {
                    analayteItems = selectedItems[item.Testid];

                    console.log(item.Analyteid);
                    console.log(analayteItems.indexOf(item.Analyteid));
                    if (analayteItems.indexOf(item.Analyteid) > -1) {
                        console.log('*********Analyteitens********');
                        console.log(analayteItems);

                        item.IsPrint = 'yes';
                    }
                    // console.log(item);
                }

                if (item.PatientOrderDetail.Testmaster) {
                    if (item.PatientOrderDetail.Testmaster.IsNABLTest) {
                        item.IsNABLTest = item.PatientOrderDetail.Testmaster.IsNABLTest;
                    }
                }
                if (item.RootProfileName) {
                    if (item.IsNABLTest) {
                        item.RootProfileName = item.RootProfileName + '**';
                    }
                }
                if (!item.RootProfileName) {
                    if (item.IsNABLTest) {
                        item.Testname = item.Testname + '**';
                    }
                }
                if (item.Resultvalue && item.TestValueType === '1') {
                    item.Resultvalue =
                        item.Resultvalue.replace(/\n/g, '<br />');
                }
                item.IsTemplates = false;
                if (item.Analyte) {
                    item.IsTemplates = item.Analyte.IsTemplates;
                }
                item.IsCulture = false;
                if (item.Testmaster) {
                    item.IsCulture = item.Testmaster.IsCulture;
                }
                item.IsWrapResult = false;
                if (item.Analyte) {
                    item.IsWrapResult = item.Analyte.IsWrapResult;
                }
                for (let k = 0; k < attachments.length; k++) {
                    let attitem = attachments[k];
                    if (item.Id === attitem.WorkOrderDetailId) {
                        item.FilePath = attitem.FilePath;
                        if (item.FilePath) {
                            try {
                                let fileBuff = await readFileSync(item.FilePath);
                                let Thumbnail = new Buffer(fileBuff).toString('base64');
                                item.Thumbnail = Thumbnail;
                            } catch (ex) {
                                item.FilePath = null;
                                item.Thumbnail = null;
                            }
                        }
                    }
                    if (!attitem.WorkOrderDetailId) {
                        if (!AttachmentImgGroups[attitem.Id]) {
                            AttachmentImgGroups[attitem.Id] = attitem.Id;
                            AttachmentImgs.push(attitem);
                        }
                    }
                }
                if (Sampleid.indexOf(item.Sampleid) < 0) {
                    if (Sampleid.length === 0) Sampleid += item.Sampleid;
                    else Sampleid += ',' + item.Sampleid;
                }
                if (!item.FilePath) {
                    item.FilePath = null;
                    item.Thumbnail = null;
                }
                PatientWorkorderDetail.push(item);
            }
        }
        let EReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientWorkorders.EncounterId }]
        };
        let EncounterBo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
        let EncounterData = await EncounterBo.GetEncounters(EReq);
        let EncounterValue = EncounterData.Data[0];
        let RReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferralFilters.Id, Value: EncounterValue.ReferralId }
            ]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let ReferralData = await ReferralBo.GetReferrals(RReq);
        let ReferralValue = ReferralData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];
        let showApprovedBy: any = null;
        if (PatientWorkorders.WorkOrderStatusId === 7 ||
            PatientWorkorders.WorkOrderStatusId === 8 ||
            PatientWorkorders.WorkOrderStatusId === 9) {
            showApprovedBy = 'Approved';
        } else {
            showApprovedBy = null;
        }
        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            Age: Age,
            PatientWorkorderDetails: PatientWorkorderDetail,
            Sampleid: Sampleid,
            Patient: patientData,
            Attachments: AttachmentImgs,
            EncounterValue: EncounterValue,
            ReferralValue: ReferralValue,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData,
            showApprovedBy: showApprovedBy,
            PackageName: PackageName,
            IDS: req.Data.ids,
            Flags: flags
        };

        let key = 'externallabwithoutheader';
        /*if (req.Data && req.Data.IsDepartment) {
            key = 'labbydept';
        }*/
        if (info.PatientWorkorder.TestTypeId === 2) {
            key = 'radiologylabresult';
        }
        if (info.IDS === 1) {
            key = 'histopathology';
        }
        console.log('key');
        console.log(key);
        if (PatientWorkorders.MedValidationById === null) {
            info.text = '* This is a Intermediate  Print Hence Need Approval';
            info.Title = 'LAB REPORT';
        } else {
            info.Title = 'LAB REPORT';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (info.Flags.header === 0) {
            pdfOptionJSON = await Report.GetPdfOptionWoh(key);
        }
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientWorkorder.WorkOrderStatusId === 4 || info.PatientWorkorder.WorkOrderStatusId === 5) {
            Watermark = 'PROVISIONAL';
            PrintTypeId = 2;
        }
        let printInfo = {
            ObjectId: req.Id
            , ObjectTypeId: 4 /*Order*/
            , Reason: req.Data ? req.Data.Reason : null
            , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
            , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        };
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
        if ((printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2)) {
            Watermark = Watermark || '';
        }
        // pdfOption = JSON.parse(pdfOptionJSON);
        // pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        if (IsSave && IsSave === true) {
            let filename = patientData.MRN + PatientWorkorders.Id + '.pdf';
            return await Report.GeneratePdf(key, { header: {}, body: info, watermark: Watermark }, filename, null, pdfOption);
        } else {
            return await Report.Generate(key, { header: {}, body: info, watermark: Watermark }, null, pdfOption);
        }
    }

    public async sendLabResultWhatsApp(req: BaseRequest): Promise<any> {
        try {
            let workdata = await this.GetPatientWorkorderById({ Id: req.Id });
            let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let appointmentBo = BoFactory.GetBo(aptbo.AppointmentBo, this.Request);
            let faciliBO = BoFactory.GetBo(appbo.FacilityBo, this.Request);
            let facilityData = await faciliBO.GetFacilityById({ Id: this.Session.FacilityId });
            let landline = facilityData.LandLine;
            let patientData;
            patientData = await patientBO.GetPatientById({ Id: workdata.Patientid });
            if (patientData) {
                if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                    let printData: any = {
                        Id: req.Id,
                        Data: {
                            isfrom: 'resultdispatch'
                        }
                    };
                    let resAttach = await this.PrintPatientWorkorderWithoutheader(printData, true);

                    let vPatientName = '';
                    let filename = patientData.MRN + req.Id + '.pdf';
                    vPatientName = await appointmentBo.getPatientName(patientData);
                    console.log(resAttach, 'here is your Attachment');
                    let data = {
                        template: 'labreport',
                        Mobile: patientData.Mobile,
                        patientName: vPatientName,
                        contact: landline,
                        filename: filename,
                        link: process.env.WHATSAPP_DOMAIN + 'docs/' + filename
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is the labresultforchampion');
                }
            }
        } catch (error) {
            console.error('Error in SendLabResult:', error);
            return false;
        }
        return true;
    }

    public async PrintVirtualPatientWorkorder(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetVirtualPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];

        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let woSampleReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderSampleFilters.WorkOrderId, Value: req.Id }]
        };
        let wSampleBO = BoFactory.GetBo(lisbo.WorkOrderSampleBo, this.Request);
        let WSampleData = await wSampleBO.GetWorkOrderSamples(woSampleReq);
        let SampleData: any = WSampleData.Data[0];

        let woSampledetReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderSampleDetailFilters.WorkOrderSampleId, Value: SampleData.Id }]
        };
        let wSampledetBO = BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request);
        let WSampleDetailData = await wSampledetBO.GetWorkOrderSampleDetails(woSampledetReq);
        let SampleDetailData: any = WSampleDetailData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];

        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
        };

        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                ['TestPrintOrder', 'AnalytePrintOrder'],
                ['asc', 'asc']);
        }

        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        //console.log('attachments');
        //console.log(attachments);
        let PatientWorkorderDetail = [];
        let Sampleid = '';
        let AttachmentImgs = [];
        let AttachmentImgGroups: any = {};
        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            let item: any;
            item = PatientWorkorderDetailData.Data[i];
            if (item.Resultvalue && item.TestValueType === '1') {
                item.Resultvalue =
                    item.Resultvalue.replace(/\n/g, '<br />');
            }
            for (let k = 0; k < attachments.length; k++) {
                let attitem = attachments[k];
                if (item.Id === attitem.WorkOrderDetailId) {
                    item.FilePath = attitem.FilePath;
                    if (item.FilePath) {
                        try {
                            let fileBuff = await readFileSync(item.FilePath);
                            let Thumbnail = new Buffer(fileBuff).toString('base64');
                            item.Thumbnail = Thumbnail;
                        } catch (ex) {
                            item.FilePath = null;
                            item.Thumbnail = null;
                        }
                    }
                }
                if (!attitem.WorkOrderDetailId) {
                    if (!AttachmentImgGroups[attitem.Id]) {
                        AttachmentImgGroups[attitem.Id] = attitem.Id;
                        AttachmentImgs.push(attitem);
                    }
                }
            }
            if (Sampleid.indexOf(item.Sampleid) < 0) {
                if (Sampleid.length === 0) Sampleid += item.Sampleid;
                else Sampleid += ',' + item.Sampleid;
            }
            if (!item.FilePath) {
                item.FilePath = null;
                item.Thumbnail = null;
            }
            PatientWorkorderDetail.push(item);
        }
        let EReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientWorkorders.EncounterId }]
        };
        let EncounterBo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
        let EncounterData = await EncounterBo.GetEncounters(EReq);
        let EncounterValue = EncounterData.Data[0];
        let RReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferralFilters.Id, Value: EncounterValue.ReferralId }
            ]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let ReferralData = await ReferralBo.GetReferrals(RReq);
        let ReferralValue = ReferralData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];

        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetail,
            Sampleid: Sampleid,
            SampleDetailData: SampleDetailData,
            SampleData: SampleData,
            Patient: patientData,
            Attachments: AttachmentImgs,
            EncounterValue: EncounterValue,
            ReferralValue: ReferralValue,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData,
            url: 'https%3A%2F%2Fswostha.com%2F%23%2Fselflabprintcertificate%2F' + req.Id
        };

        let key = 'externallab';
        /*if (req.Data && req.Data.IsDepartment) {
            key = 'labbydept';
        }*/
        if (info.PatientWorkorder.TestTypeId === 2) {
            key = 'radiologylabresult';
        }
        console.log('key');
        console.log(key);
        if (PatientWorkorders.MedValidationById === null) {
            info.text = '* This is a Intermediate  Print Hence Need Approval';
            info.Title = 'LAB REPORT';
        } else {
            info.Title = 'LAB REPORT';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '2.1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        // if (info.PatientWorkorder.WorkOrderStatusId === 6) {
        //     Watermark = 'REJECTED';
        //     PrintTypeId = 2;
        // }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info, pdfOption }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async Printendoscopy(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
        };

        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                ['TestPrintOrder', 'AnalytePrintOrder'],
                ['asc', 'asc']);
        }

        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        //console.log('attachments');
        //console.log(attachments);
        let PatientWorkorderDetail = [];
        let AttachmentImgs = [];
        let AttachmentImgGroups: any = {};
        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            let item: any;
            item = PatientWorkorderDetailData.Data[i];
            if (item.Resultvalue && item.TestValueType === '1') {
                item.Resultvalue =
                    item.Resultvalue.replace(/\n/g, '<br />');
            }
            for (let k = 0; k < attachments.length; k++) {
                let attitem = attachments[k];
                if (item.Id === attitem.WorkOrderDetailId) {
                    item.FilePath = attitem.FilePath;
                    if (item.FilePath) {
                        try {
                            let fileBuff = await readFileSync(item.FilePath);
                            let Thumbnail = new Buffer(fileBuff).toString('base64');
                            item.Thumbnail = Thumbnail;
                        } catch (ex) {
                            item.FilePath = null;
                            item.Thumbnail = null;
                        }
                    }
                }
                if (!attitem.WorkOrderDetailId) {
                    if (!AttachmentImgGroups[attitem.Id]) {
                        AttachmentImgGroups[attitem.Id] = attitem.Id;
                        AttachmentImgs.push(attitem);
                    }
                }
            }
            if (!item.FilePath) {
                item.FilePath = null;
                item.Thumbnail = null;
            }
            PatientWorkorderDetail.push(item);
        }

        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetail,
            Patient: patientData,
            Attachments: AttachmentImgs,
            Preferences: printPreferencesData
        };
        let key = 'endoscopy';
        /*if (req.Data && req.Data.IsDepartment) {
            key = 'labbydept';*/
        console.log('key');
        console.log(key);
        if (PatientWorkorders.MedValidationById === null) {
            info.text = '* This is a Intermediate  Print Hence Need Approval';
            info.Title = 'LAB REPORT';
        } else {
            info.Title = 'LAB REPORT';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '3in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        // if (info.PatientWorkorder.WorkOrderStatusId === 6) {
        //     Watermark = 'REJECTED';
        //     PrintTypeId = 2;
        // }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info, pdfOption }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }
    public async PrintExternalLab(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }
            ]
        };

        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });


        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        let EReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientWorkorders.EncounterId }]
        };
        let EncounterBo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
        let EncounterData = await EncounterBo.GetEncounters(EReq);
        let EncounterValue = EncounterData.Data[0];
        let RReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferralFilters.Id, Value: EncounterValue.ReferralId }
            ]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let ReferralData = await ReferralBo.GetReferrals(RReq);
        let ReferralValue = ReferralData.Data[0];
        console.log('attachments');
        console.log(attachments);

        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        //let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];
        let showApprovedBy: any = null;
        if (PatientWorkorders.WorkOrderStatusId === 7 ||
            PatientWorkorders.WorkOrderStatusId === 8 ||
            PatientWorkorders.WorkOrderStatusId === 9) {
            showApprovedBy = 'Approved';
        } else {
            showApprovedBy = null;
        }
        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetailData.Data,
            Patient: patientData,
            Attachments: attachments,
            EncounterValue: EncounterValue,
            ReferralValue: ReferralValue,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData,
            showApprovedBy: showApprovedBy,
            Flags: flags
        };
        info.Title = 'LAB REPORT';
        let reportKey = 'workorder1';
        if (info.PatientWorkorder.Subdepartmentid === 132) {
            reportKey = 'echo';
        }
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(reportKey, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintLabRedoReport(apiReq?: ApiRequest<PatientWorkorderFilters>): Promise<any> {
        let data = await this.GetPatientWorkorders(apiReq);
        let LabRedo = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let Department = apiReq.Data.Department;
        let LabRedoData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(LabRedoData.FacilityId);
        let info = {
            LabRedo: LabRedo,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            Department: Department,
        };
        let pdfOption: any = null;
        let key = 'labredoreport';
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
    public async Printecho(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }
            ]
        };

        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });


        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        let EReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientWorkorders.EncounterId }]
        };
        let EncounterBo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
        let EncounterData = await EncounterBo.GetEncounters(EReq);
        let EncounterValue = EncounterData.Data[0];
        let RReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ReferralFilters.Id, Value: EncounterValue.ReferralId }
            ]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let ReferralData = await ReferralBo.GetReferrals(RReq);
        let ReferralValue = ReferralData.Data[0];
        console.log('attachments');
        console.log(attachments);

        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        //let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];

        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetailData.Data,
            Patient: patientData,
            Attachments: attachments,
            EncounterValue: EncounterValue,
            ReferralValue: ReferralValue,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData
        };
        info.Title = '';
        let reportKey = 'echo1';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(reportKey, { header: {}, body: info }, null, pdfOption);
    }
    public async printWorkSheet(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            //{ Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
        };

        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                ['TestPrintOrder', 'AnalytePrintOrder'],
                ['asc', 'asc']);
        }

        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }

        let PatientWorkorderDetail = [];
        let Sampleid = '';
        let AttachmentImgs = [];
        let AttachmentImgGroups: any = {};
        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            let item: any;
            item = PatientWorkorderDetailData.Data[i];
            if (item.Resultvalue && item.TestValueType === '1') {
                item.Resultvalue =
                    item.Resultvalue.replace(/\n/g, '<br />');
            }
            for (let k = 0; k < attachments.length; k++) {
                let attitem = attachments[k];
                if (item.Id === attitem.WorkOrderDetailId) {
                    item.FilePath = attitem.FilePath;
                    if (item.FilePath) {
                        try {
                            let fileBuff = await readFileSync(item.FilePath);
                            let Thumbnail = new Buffer(fileBuff).toString('base64');
                            item.Thumbnail = Thumbnail;
                        } catch (ex) {
                            item.FilePath = null;
                            item.Thumbnail = null;
                        }
                    }
                }
                if (!attitem.WorkOrderDetailId) {
                    if (!AttachmentImgGroups[attitem.Id]) {
                        AttachmentImgGroups[attitem.Id] = attitem.Id;
                        AttachmentImgs.push(attitem);
                    }
                }
            }
            if (Sampleid.indexOf(item.Sampleid) < 0) {
                if (Sampleid.length === 0) Sampleid += item.Sampleid;
                else Sampleid += ',' + item.Sampleid;
            }
            if (!item.FilePath) {
                item.FilePath = null;
                item.Thumbnail = null;
            }
            PatientWorkorderDetail.push(item);
        }

        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetail,
            Sampleid: Sampleid,
            Patient: patientData,
            Attachments: AttachmentImgs,
            Preferences: printPreferencesData
        };

        let key = 'patientworksheet';

        if (PatientWorkorders.MedValidationById === null) {
            info.text = '* This is a Intermediate  Print Hence Need Approval';
            info.Title = 'LAB REPORT';
        } else {
            info.Title = 'LAB REPORT';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.7in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintERCP(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }
            ]
        };

        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }

        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });


        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            if (PatientWorkorderDetailData.Data[i].Resultvalue &&
                PatientWorkorderDetailData.Data[i].TestValueType === '1') {
                PatientWorkorderDetailData.Data[i].Resultvalue =
                    PatientWorkorderDetailData.Data[i].Resultvalue.replace(/\n/g, '<br />');
            }
        }
        /////console.log('attachments');
        /////console.log(attachments);
        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetailData.Data,
            Patient: patientData,
            Attachments: attachments,
            Preferences: printPreferencesData
        };
        info.Title = 'LAB REPORT';
        let reportKey = 'printercp';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate('printercp', { header: {}, body: info }, null, pdfOption);
    }
    public async Printmicrobiology(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let PatientWorkorderDetailData: any;
        if (req.Data && req.Data.selectedtests && (!req.Data.isfrom || req.Data.isfrom !== 'resultdispatch')) {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        }
        if (req.Data.isfrom === 'resultdispatch') {
            let Req = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
                { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
                { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }]
            };
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
            let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        }
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }
        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            if (PatientWorkorderDetailData.Data[i].Resultvalue &&
                PatientWorkorderDetailData.Data[i].TestValueType === '1') {
                PatientWorkorderDetailData.Data[i].Resultvalue =
                    PatientWorkorderDetailData.Data[i].Resultvalue.replace(/\n/g, '<br />');
            }
        }
        // console.log('attachments');
        // console.log(attachments);

        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];

        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetailData.Data,
            Patient: patientData,
            Attachments: attachments,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData
        };
        info.Title = 'LAB REPORT';
        let reportKey = 'microbiology';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate('microbiology', { header: {}, body: info }, null, pdfOption);
    }
    public async Printpathaology(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientWorkorders(apiReq);
        let PatientWorkorders: any = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: req.Id },
            { Key: PatientWorkorderdetailsFilters.WorkOrderDetailStatusId, Value: 4 },
            { Key: PatientWorkorderdetailsFilters.IncludeObservations, Value: true }
            ]
        };
        if (req.Data && req.Data.selectedtests) {
            Req.Params.push({ Key: PatientWorkorderdetailsFilters.TestIds, Value: req.Data.selectedtests });
        }
        let PatientWorkorderDetailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderDetailBo.GetPatientWorkorderdetailss(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientWorkorders.PatientId });
        if (PatientWorkorderDetailData && PatientWorkorderDetailData.Data) {
            PatientWorkorderDetailData.Data = _.orderBy(PatientWorkorderDetailData.Data,
                ['TestPrintOrder', 'AnalytePrintOrder'],
                ['asc', 'asc']);
        }
        let apiReqAtt = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: WorkOrderAttachmentFilters.WorkOrderId, Value: req.Id }]
        };
        let WorkOrderAttachmentBo = BoFactory.GetBo(lisbo.WorkOrderAttachmentBo, this.Request);
        let attachData = await WorkOrderAttachmentBo.GetWorkOrderAttachments(apiReqAtt);
        let attachments: any = attachData.Data;
        let printPreferencesData = null;
        if (PatientWorkorders && PatientWorkorders.FacilityId) {
            let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
            printPreferencesData =
                await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientWorkorders.FacilityId);
        }

        for (let i = 0; i < PatientWorkorderDetailData.Data.length; i++) {
            if (PatientWorkorderDetailData.Data[i].Resultvalue &&
                PatientWorkorderDetailData.Data[i].TestValueType === '1') {
                PatientWorkorderDetailData.Data[i].Resultvalue =
                    PatientWorkorderDetailData.Data[i].Resultvalue.replace(/\n/g, '<br />');
            }
        }
        console.log('attachments');
        console.log(attachments);

        let PatientOrderReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: PatientWorkorders.Orderid }]
        };
        let PatientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let PatientOrderData = await PatientOrderBo.GetPatientOrders(PatientOrderReq);
        let PatientOrder: any = PatientOrderData.Data[0];

        let PatientBillsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: PatientOrder.BillingId }]
        };
        let PatientBillsBo = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(PatientBillsReq);
        let PatientBills: any = PatientBillsData.Data[0];

        let ReferralsReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ReferralFilters.Id, Value: PatientBills.ReferralId }]
        };
        let ReferralBo = BoFactory.GetBo(Referral.ReferralBo, this.Request);
        let PatientBillReferralData = await ReferralBo.GetReferrals(ReferralsReq);
        let PatientBillReferral: any = PatientBillReferralData.Data[0];

        let info = {
            text: '',
            Title: '',
            PatientWorkorder: PatientWorkorders,
            PatientWorkorderDetails: PatientWorkorderDetailData.Data,
            Patient: patientData,
            Attachments: attachments,
            PatientBill: PatientBills,
            PatientBillReferral: PatientBillReferral,
            Preferences: printPreferencesData
        };
        info.Title = 'LAB REPORT';
        let reportKey = 'pathaology';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate('pathaology', { header: {}, body: info }, null, pdfOption);
    }
    public async DispatchResult(req: BaseRequest): Promise<Boolean> {
        let result = true;
        let workOrderDispatch: any = {
            Id: 0, ReleasedBy: this.Session.UserId, ReleasedDate: new Date(),
            IsReleased: true, WorkOrderStatusId: 8
        };
        await this.Models.PatientWorkorder.update(workOrderDispatch, {
            fields: ['ReleasedBy', 'ReleasedDate', 'IsReleased', 'WorkOrderStatusId'],
            where: {
                Id: req.Id
            }
        });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.itemId.Patientid);
        const userBO = BoFactory.GetBo(appbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.itemId.Orderedbyid });
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your lab result is dispatched,have look in DrHMS' + '.';
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
            const pushMessage: string = 'Dear ' + doctorData.FirstName + ', ' + patient.FirstName + ', ' + ' lab result is dispatched, please have look in DrHMS' + '.';
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
        let woDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        await woDetailBO.DispatchResultDetails(req.Id);
        // if (req.Data.Header.WorkOrderStatusId === 8) {
        try {
            await this.sendLabResultWhatsApp(req);
        } catch (error) {
            console.error('Error in sendLabResultWhatsApp:', error);
        }

        try {
            await this.sendLABApprovedResultSMS(req);
        } catch (error) {
            console.error('Error in sendLABApprovedResultSMS:', error);
        }

        try {
            await this.sendLABApprovedResultEmail(req);
        } catch (error) {
            console.error('Error in sendLABApprovedResultEmail:', error);
        }
        // }
        return result;
    }

    public async sendLABApprovedResultEmail(req: BaseRequest): Promise<any> {
        let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let appointmentBo = BoFactory.GetBo(aptbo.AppointmentBo, this.Request);
        let patientData;
        if (req.Data) {
            if (req.Data.itemId.Patientid) {
                patientData = await patientBO.GetPatientById({ Id: req.Data.itemId.Patientid });
            }
        } else {
            patientData = await patientBO.GetPatientById({ Id: req.Data.itemId.Patientid });
        }
        if (patientData) {
            if (patientData.Email) {
                let eventTemplateBO = BoFactory.GetBo(appbo.EventTemplateBo, this.Request);
                let mailTemplateInfo = await eventTemplateBO.GetTemplateInfo('LabApprovedOrder', 'LabApprovedOrder', 2);
                let vPatientName = '';
                vPatientName = await appointmentBo.getPatientName(patientData);
                const mailData = {
                    patientName: vPatientName,
                };
                if (mailTemplateInfo) {
                    const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                    const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);
                    let printData: any = {
                        Id: req.Data.Id,
                        Data: {
                            isfrom: 'resultdispatch'
                        }
                    };
                    let resAttach = await this.PrintPatientWorkorder(printData);

                    let mailProvider = this.GetMailProvider();
                    await mailProvider.send({
                        from: 'From DrHMS <report@drhms.com>',
                        to: patientData.Email,
                        subject: mailSubject,
                        html: mailBody,
                        attachments: [{ path: resAttach.filename }]
                    });
                    unlinkSync(resAttach.filename);
                }

            }
            console.log(AppConfig.UploadFilePath);
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'ProMed') {
                let printData: any = {
                    Id: req.Data.Id,
                    Data: {
                        isfrom: 'resultdispatch'
                    }
                };
                let resAttach = await this.PrintPatientWorkorder(printData, true);

                let vPatientName = '';
                let filename = patientData.MRN + req.Id + '.pdf';
                vPatientName = await appointmentBo.getPatientName(patientData);
                console.log(resAttach);
                let data = {
                    payload: {
                        name: '',
                        components: [
                            {
                                type: 'header',
                                parameters: [
                                    {
                                        type: 'document',
                                        document: {
                                            filename: 'labresult',
                                            link: process.env.WHATSAPP_DOMAIN + 'docs/' + filename
                                        }
                                    }
                                ]
                            },
                            {
                                type: 'body',
                                parameters: [
                                    {
                                        type: 'text',
                                        text: vPatientName
                                    },
                                    // {
                                    //     type: 'text',
                                    //     text: vDoctorName
                                    // },
                                    // {
                                    //     type: 'text',
                                    //     text: moment(req.Data.AppointmentDate).format(dateformat)
                                    // },
                                    {
                                        type: 'text',
                                        text: ' '
                                    }
                                ]
                            }
                        ],
                        language: {
                            code: 'en_US',
                            policy: 'deterministic'
                        },
                        namespace: '617a3aff_6cf4_4d2f_889c_67c430bd8157'
                    },
                    phoneNumber: patientData.Mobile
                };
                data.payload.name = 'pro_document_investigation';
                // if (req.Data.AppointmentStatusId === 2 || req.Data.AppointmentStatusId === 3) {
                //     data.payload.name = 'pro_doc_test';
                // } else if (req.Data.AppointmentStatusId === 4) {
                //     data.payload.name = 'pro_hms_reschedule_appointment_final';
                // } else if (req.Data.AppointmentStatusId === 5) {
                //     data.payload.name = 'pro_hms_appointment_cancel_final';
                //     let cancel: any = {
                //         type: 'text',
                //         text: req.Data.CancelorRescheduleComments
                //     };
                //     data.payload.components[0].parameters.push(cancel);
                // }
                if (data.payload.name !== '') {
                    console.log('************WhatsApp*********');
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }

            } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
                let printData: any = {
                    Id: req.Data.Id,
                    Data: {
                        isfrom: 'resultdispatch'
                    }
                };
                let resAttach = await this.PrintPatientWorkorder(printData, true);

                let vPatientName = '';
                let filename = patientData.MRN + req.Id + '.pdf';
                vPatientName = await appointmentBo.getPatientName(patientData);
                console.log(resAttach);

                // let dateformat = 'DD/MM/YYYY';
                let data = {
                    channelId: '64ef1968000b0fe0d6e2847c',
                    channelType: 'whatsapp',
                    recipient: {
                        name: vPatientName,
                        phone: '91' + Number(patientData.Mobile)
                    },
                    whatsapp: {
                        type: 'template',
                        template: {
                            templateName: '',
                            headerValues: {
                                mediaUrl: process.env.WHATSAPP_DOMAIN + 'docs/' + filename,
                                mediaName: filename
                            },
                            bodyValues: {
                            }
                        }
                    }
                };
                data.whatsapp.template.templateName = 'lab_report_clone';
                if (data.whatsapp.template.templateName !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }

            }
        }
        return true;
    }

    public GetModel(): SStatic.Model<PatientWorkorderInstance, PatientWorkorderAttributes> {
        return this.Models.PatientWorkorder;
    }
    // public async GetLABInfoDashBoard(req: BaseRequest): Promise<any> {
    //     let LABNotOrderProcessCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': 1,
    //             'UserId': { '$ne': null },
    //             'WorkOrderStatusId': { '$in': [2, 3, 4, 6] }
    //             // 'Ordereddate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     });
    //     let LABRejectedOrderProcessCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': 1,
    //             'UserId': { '$ne': null },
    //             'WorkOrderStatusId': { '$in': [6] }
    //             // 'Ordereddate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     });
    //     let LABResultNotApprovalCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': req.Data.Testtypeid,
    //             'UserId': { '$ne': null },
    //             'WorkOrderStatusId': { '$in': [5, 9] }
    //             // 'Ordereddate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     });
    //     let LABResultNotReleaseCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': req.Data.Testtypeid,
    //             'UserId': { '$ne': null },
    //             'WorkOrderStatusId': { '$in': [7] }
    //             // 'Ordereddate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     });
    //     return {
    //         'LABNotOrderProcessCount': LABNotOrderProcessCount,
    //         'LABResultNotApprovalCount': LABResultNotApprovalCount,
    //         'LABResultNotReleaseCount': LABResultNotReleaseCount,
    //         'LABRejectedOrderProcessCount': LABRejectedOrderProcessCount
    //     };
    // }


}
