import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PrescriptionInstance, PrescriptionAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbO from '../../Pharmacy/Business/Index';
import { PrescriptionFilters, PrescriptionDetailFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { ItemMasterFilters } from '../../Pharmacy/Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientAttributes } from '../../Registration/Model/Interface/Index';
import { FacilityAttributes } from '../../SystemSettings/Model/Interface/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import * as appbo from '../../Appointment/Business/Index';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { join } from 'path';

export class PrescriptionBo extends BaseBo<PrescriptionInstance, PrescriptionAttributes> {

    public async AddPrescription(req: BaseRequest): Promise<number> {
        if (!req.Data || !req.Data.Header || !req.Data.Header.PatientId || req.Data.Header.PatientId <= 0) {
            throw new Error('A valid PatientId is required to create a prescription.');
        }
        if (!req.Data.Header.EncounterId || req.Data.Header.EncounterId <= 0) {
            throw new Error('A valid EncounterId is required to create a prescription.');
        }
        let generateprscription = 0;
        if (req.Data.Header.PrecriptionStatusId === 3 //Prescribed
            && !req.Data.Header.Identifier) {
            generateprscription = 1;
            req.Data.Header.Identifier = null;
            // await Sequence.Next(SequenceKeys.PrescriptionId);
        }
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        // let eMARBO = BoFactory.GetBo(bo.EmarBo, this.Request);
        let prescriptionId = result.dataValues.Id;
        let patientId = req.Data.Header.PatientId;
        let encId = req.Data.Header.EncounterId;
        let storeId = req.Data.Header.PharmacyId;
        let prescDate = req.Data.Header.PrescriptionDate;
        if (generateprscription === 1) {
            this.deferSequenceKey(prescriptionId, 'Identifier',
                this.getSequenceIdentifier(SequenceKeys.PrescriptionId));
        }
        const userBO = BoFactory.GetBo(userbo.UserBo, this.Request);
        const doctorData: any = await userBO.GetUserById({ Id: req.Data.Header.DoctorId });
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(req.Data.Header.PatientId);

        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + doctorData.DoctorName + ' Your prescription detail is created,have look in DrHMS' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            if (patient.WebNotificationToken) {
                pushTokens.push(patient.WebNotificationToken);
            }

            await notificationService.sendNotification(pushMessage, pushTokens, body);
        }
        await detailBO.ManagePrescriptionDetails(prescriptionId, patientId, encId, storeId, prescDate, req.Data.Details);
        // await eMARBO.ManageEmars(req.Data.Details);
        await this.sendPrescriptionSMS(req);
        return prescriptionId;
    }
    public async sendPrescriptionSMS(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PrecriptionStatusId === 3) {
            let patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
            let patientData = await patientBO.GetPatientById({ Id: req.Data.Header.PatientId });
            if (patientData) {
                if (patientData.Mobile) {
                    let smsProvider = this.GetSmsProvider();
                    let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                    let facilityBO = BoFactory.GetBo(userbo.FacilityBo, this.Request);
                    let facilitydata = await facilityBO.GetFacilityById({ Id: req.Data.Header.FacilityId });
                    let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Prescriptions', 'Prescriptions', 1);
                    if (smsTemplateInfo) {
                        let vPatientName = '';
                        vPatientName = await this.getPatientName(patientData);
                        let vFacilityNumber = '';
                        vFacilityNumber = await this.getFacilityNumber(facilitydata);
                        let smsmodel = {
                            numbers: [patientData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: vPatientName,
                                    facilityNumber: vFacilityNumber,
                                    facilityName: this.Session.FacilityName,
                                })
                        };
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + patientData.Mobile);
                        }
                    }
                }
            }
        }
        return true;
    }
    public async getPatientName(patientData: PatientAttributes): Promise<string> {
        let vPatientName = '';
        if (patientData) {
            if (patientData.FirstName) vPatientName += patientData.FirstName;
            if (patientData.LastName) vPatientName += ' ' + patientData.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patientData.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData.Data) {
                if (TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
            }
            if (vTitleName)
                vPatientName = vTitleName + '.' + vPatientName;
        }
        return vPatientName;
    }
    public async getFacilityNumber(facilitydata: FacilityAttributes): Promise<string> {
        let vFacilityNumber = '';
        if (facilitydata) {
            if (facilitydata.LandLine) vFacilityNumber += ' ' + facilitydata.LandLine;
        }
        return vFacilityNumber;
    }
    public async UpdatePrescription(req: BaseRequest): Promise<boolean> {
        let generateprscription = 0;
        if (req.Data.Header.PrecriptionStatusId === 3 //Prescribed
            && !req.Data.Header.Identifier) {
            generateprscription = 1;
            req.Data.Header.Identifier = null;
            // await Sequence.Next(SequenceKeys.PrescriptionId);
        }
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        let prescriptionId = req.Data.Header.Id;
        let patientId = req.Data.Header.PatientId;
        let encId = req.Data.Header.EncounterId;
        let storeId = req.Data.Header.PharmacyId;
        let prescDate = req.Data.Header.PrescriptionDate;
        if (generateprscription === 1) {
            this.deferSequenceKey(prescriptionId, 'Identifier',
                this.getSequenceIdentifier(SequenceKeys.PrescriptionId));
        }
        await detailBO.ManagePrescriptionDetails(prescriptionId, patientId, encId, storeId, prescDate, req.Data.Details);
        return result;
    }

    public async ManagePrescriptionNote(req: BaseRequest): Promise<boolean> {
        let details: PrescriptionAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }


    public async UpdateCancelPrescription(req: BaseRequest): Promise<boolean> {
        let generateprscription = 0;
        if (req.Data.Header.PrecriptionStatusId === 3 //Prescribed
            && !req.Data.Header.Identifier) {
            generateprscription = 1;
            req.Data.Header.Identifier = null;
            // await Sequence.Next(SequenceKeys.PrescriptionId);
        }
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        let prescriptionId = req.Data.Header.Id;
        let prescribeStatusId = req.Data.Header.PrecriptionStatusId;
        if (generateprscription === 1) {
            this.deferSequenceKey(prescriptionId, 'Identifier',
                this.getSequenceIdentifier(SequenceKeys.PrescriptionId));
        }
        await detailBO.ManageCancelPrescriptionDetails(prescriptionId, prescribeStatusId, req.Data.Details);
        return result;
    }

    public async CreatePrescription(req: BaseRequest): Promise<number> {
        req.Data.Header.PrescriptionDate = new Date();
        req.Data.Header.PrecriptionStatusId = 3;
        req.Data.Header.PrescriptionPriorityId = 1;
        req.Data.Header.PharmacyId = req.Data.Header.ToStoreId;
        req.Data.Header.DispenseStatusId = 1;
        req.Data.Header.EncounterTypeId = 2;
        req.Data.Header.Identifier = null;
        if (req.Data.Header.IsCash) {
            req.Data.Header.IsCash = req.Data.Header.IsCash;
        }
        //await Sequence.Next(SequenceKeys.PrescriptionId);
        let result = await this.Save(req.Data.Header);

        for (let i = 0, len = req.Data.Details.length; i < len; i++) {
            if (req.Data.Details[i].Id <= 0) {
                if (req.Data.Details[i].DrugId > 0 && req.Data.Details[i].Status === 1) {
                    req.Data.Details[i].IsGeneric = 0;
                    req.Data.Details[i].GenericId = -1;
                    req.Data.Details[i].PharmacyId = req.Data.Header.PharmacyId;
                    req.Data.Details[i].Quantity = req.Data.Details[i].RequestedQuantity;
                    if (req.Data.Details[i].Quantity <= 0) {
                        req.Data.Details[i].DrugFrequencyId = 0;
                        req.Data.Details[i].DrugRouteId = 0;
                        req.Data.Details[i].Dosage = 0;
                        req.Data.Details[i].Duration = 0;
                        req.Data.Details[i].DurationPeriodId = 0;
                        req.Data.Details[i].Quantity = req.Data.Details[i].RequestedQuantity;
                    }
                    req.Data.Details[i].DispensedQuantity = 0;
                }
            } else {
                req.Data.Details[i].TempId = req.Data.Details[i].Id;
                if (req.Data.Details[i].DrugId > 0 && req.Data.Details[i].Status === 1) {
                    req.Data.Details[i].Id = 0;
                    req.Data.Details[i].IsGeneric = 0;
                    req.Data.Details[i].GenericId = -1;
                    req.Data.Details[i].PharmacyId = req.Data.Header.PharmacyId;
                    req.Data.Details[i].Quantity = req.Data.Details[i].RequestedQuantity;
                    if (req.Data.Details[i].Quantity <= 0) {
                        req.Data.Details[i].DrugFrequencyId = 0;
                        req.Data.Details[i].DrugRouteId = 0;
                        req.Data.Details[i].Dosage = 0;
                        req.Data.Details[i].Duration = 0;
                        req.Data.Details[i].DurationPeriodId = 0;
                        req.Data.Details[i].Quantity = req.Data.Details[i].RequestedQuantity;
                    }
                    req.Data.Details[i].DispensedQuantity = 0;
                }
            }
        }

        let detailBO = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        let prescriptionId = result.dataValues.Id;
        req.Data.Header.PrescriptionId = prescriptionId;
        req.Data.Header.Id = 0;
        await detailBO.CreatePrescriptionDetails(prescriptionId, req.Data.Details);
        this.deferSequenceKey(prescriptionId, 'Identifier',
            this.getSequenceIdentifier(SequenceKeys.PrescriptionId));
        return prescriptionId;
    }

    public async CancelPrescription(req: BaseRequest): Promise<any> {
        let prescription = await this.GetPrescriptionById({ Id: req.Data.Header.PrescriptionId });
        prescription.PrecriptionStatusId = 2;
        await this.Update(prescription);
    }

    public async CompletePrescription(req: BaseRequest): Promise<any> {
        let prescription = await this.GetPrescriptionById({ Id: req.Data.Header.PrescriptionId });
        prescription.DispenseStatusId = 2;
        await this.Update(prescription);
    }

    public async RejectPrescription(req: BaseRequest): Promise<any> {
        let prescription = await this.GetPrescriptionById({ Id: req.Data.Header.PrescriptionId });
        prescription.DispenseStatusId = 4;
        prescription.PrecriptionStatusId = 5;
        await this.Update(prescription);
    }

    public async ManagePrescription(PatientBillId: number, request: any): Promise<any> {
        let prescription = await this.GetPrescriptionById({ Id: request.Header.PrescriptionId });
        prescription.DispenseStatusId = 2;
        await this.Update(prescription);

        let PDBo = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        await PDBo.ManagePrescriptionItemDetails(PatientBillId, request);
    }

    public async ManagePatientPrescription(PatientDispenseId: number, request: any): Promise<any> {
        let prescription = await this.GetPrescriptionById({ Id: request.Header.PrescriptionId });
        if (request.Header.PatientRequestStatusId === 5) {
            prescription.DispenseStatusId = 2;
        }
        await this.Update(prescription);

        let PDBo = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        await PDBo.ManagePrescriptionItemDetails(PatientDispenseId, request);
    }

    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'prescription':
    //             count = await this.Items.count({
    //                 where: {
    //                     'PrecriptionStatusId': { '$in': [3] },  //SCHEDULED, CONFIRMED, CHECKEDIN
    //                     'DoctorId': this.GetSession().UserId
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
        let prescriptioncount = await this.Items.count({
            where: {
                'Status': 1,
                'PrecriptionStatusId': { '$in': [3] },
                'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'prescriptioncount': prescriptioncount,
        };
    }

    public async GetPrescriptionById(req: BaseRequest): Promise<PrescriptionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPrescriptions(apiReq?: ApiRequest<PrescriptionFilters>): Promise<ApiResponse<PrescriptionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName',
                'LastName', 'LicenseNo', 'Qualification', 'SignPath'], required: false,
            include: [this.GetReference('Title'),
            { model: this.Models.Speciality, attributes: ['SpecialityName'], required: false }]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.PrescriptionDetail, required: false,
            include: [
                this.GetReference('PrescriptionPriority'),
                this.GetReference('Pharmacy'),
                this.GetReference('DrugRoute'),
                this.GetReference('DurationPeriod'),
                this.GetReference('DrugInstruction'),
                { model: this.Models.DrugFrequency, attributes: ['Name'], required: false },
                { model: this.Models.GenericMaster, attributes: ['GenericName'], required: false },
                { model: this.Models.DrugMaster, attributes: ['DrugName'], required: false }
            ]
        });
        include.push({
            model: this.Models.Diagnosis, as: 'Diagnosis', attributes: ['Code', 'DiagnosisName', 'Category'], required: false
        });
        include.push({
            model: this.Models.ServiceItem, as: 'ServiceItem', attributes: ['ItemCode', 'ShortCode', 'Name'], required: false
        });
        include.push({
            model: this.Models.Procedure, as: 'Procedure', attributes: ['Code', 'ProcedureName', 'Description'], required: false
        });
        include.push(this.GetReference('PrescriptionPriority'));
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreName'], required: false });
        // include.push(this.GetReference('Pharmacy'));
        include.push(this.GetReference('PrecriptionStatus'));
        include.push(this.GetReference('DispenseStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PrescriptionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PrescriptionFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PrescriptionFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PrescriptionFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PrescriptionFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case PrescriptionFilters.PharmacyId:
                        where['PharmacyId'] = param.Value;
                        break;
                    case PrescriptionFilters.PrecriptionStatusId:
                        where['PrecriptionStatusId'] = param.Value;
                        break;
                    case PrescriptionFilters.PrescriptionDate:
                        where['PrescriptionDate'] = param.Value;
                        break;
                    case PrescriptionFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PrescriptionFilters.From:
                        where['PrescriptionDate'] = where['PrescriptionDate'] || {};
                        (where['PrescriptionDate'] as any)['$gte'] = param.Value;
                        break;
                    case PrescriptionFilters.To:
                        where['PrescriptionDate'] = where['PrescriptionDate'] || {};
                        (where['PrescriptionDate'] as any)['$lte'] = param.Value;
                        break;
                    case PrescriptionFilters.DispenseStatusId:
                        where['DispenseStatusId'] = param.Value;
                        break;
                    case PrescriptionFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PrescriptionFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PrescriptionFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PrescriptionFilters.PrescriptionPriorityId:
                        where['PrescriptionPriorityId'] = param.Value;
                        break;
                    case PrescriptionFilters.IsDischargeMedication:
                        where['IsDischargeMedication'] = param.Value;
                        break;
                    case PrescriptionFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PrescriptionFilters.ReviewDate:
                        where['ReviewDate'] = { '$between': param.Value || '' };
                        break;
                    case PrescriptionFilters.IseMAR:
                        where['IseMAR'] = param.Value;
                        break;
                    case PrescriptionFilters.IsCash:
                        where['IsCash'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['PrescriptionDate', 'DESC']);
        // return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
        return await this.FindAndCount(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPrescriptionsWithoutDetails(apiReq?: ApiRequest<PrescriptionFilters>): Promise<ApiResponse<PrescriptionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName',
                'LastName', 'LicenseNo', 'Qualification', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('PrescriptionPriority'));
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreName'], required: false });
        // include.push(this.GetReference('Pharmacy'));
        include.push(this.GetReference('PrecriptionStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PrescriptionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PrescriptionFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PrescriptionFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PrescriptionFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PrescriptionFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case PrescriptionFilters.PharmacyId:
                        where['PharmacyId'] = param.Value;
                        break;
                    case PrescriptionFilters.PrecriptionStatusId:
                        where['PrecriptionStatusId'] = param.Value;
                        break;
                    case PrescriptionFilters.PrescriptionDate:
                        where['PrescriptionDate'] = param.Value;
                        break;
                    case PrescriptionFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PrescriptionFilters.From:
                        where['PrescriptionDate'] = where['PrescriptionDate'] || {};
                        (where['PrescriptionDate'] as any)['$gte'] = param.Value;
                        break;
                    case PrescriptionFilters.To:
                        where['PrescriptionDate'] = where['PrescriptionDate'] || {};
                        (where['PrescriptionDate'] as any)['$lte'] = param.Value;
                        break;
                    case PrescriptionFilters.DispenseStatusId:
                        where['DispenseStatusId'] = param.Value;
                        break;
                    case PrescriptionFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PrescriptionFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PrescriptionFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PrescriptionFilters.PrescriptionPriorityId:
                        where['PrescriptionPriorityId'] = param.Value;
                        break;
                    case PrescriptionFilters.IsDischargeMedication:
                        where['IsDischargeMedication'] = param.Value;
                        break;
                    case PrescriptionFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['PrescriptionDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPendingPrescriptions(req: BaseRequest): Promise<any> {
        let PrescriptionDetailBo = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageNumber: 1, PageSize: 100 },
            Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: req.Id }]
        };
        let Prescriptions = await PrescriptionDetailBo.GetPrescriptionDetails(apiReq);
        let PharmacyItems: any = [];
        await Promise.all(Prescriptions.Data.map((prescriptionitem): Promise<void> => {
            return (async (prescribeditem): Promise<void> => {
                //let prescription = prescribeditem;
                //let PrescriptionId = prescribeditem.PrescriptionId;
                let PrescriptionDetailId = prescribeditem.Id;
                let PrescribedQuantity = prescribeditem.Quantity;
                let pharmacyItemReq = {
                    Id: 0,
                    PageContext: { PageNumber: 1, PageSize: 100 },
                    Params: [{ Key: ItemMasterFilters.DrugId, Value: prescribeditem.DrugId },
                    { Key: ItemMasterFilters.StoreMasterId, Value: prescribeditem.PharmacyId }]
                };
                let itemmasterBO = BoFactory.GetBo(invbO.ItemMasterBo, this.Request);
                let ItemMasterData = await itemmasterBO.GetPrescribedItems(pharmacyItemReq);
                ItemMasterData.Data[0].StorageConditionId = PrescriptionDetailId;
                ItemMasterData.Data[0].Min = PrescribedQuantity;
                ItemMasterData.Data[0].Max = PrescribedQuantity;
                PharmacyItems.push(ItemMasterData.Data[0]);
            })(prescriptionitem);
        }));
        return PharmacyItems;
    }

    public async DeletePrescription(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async DeletePatientPrescription(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Data.Header.PrescriptionId);
    }


    public async PrintPrescription(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PrescriptionFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPrescriptions(apiReq);
        let prescription = data.Data[0];

        let presDetailBo = BoFactory.GetBo(bo.PrescriptionDetailBo);
        let apiPresDetReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: prescription.Id }]
        };
        let PrescriptionDetaildata1 = await presDetailBo.GetPrescriptionDetails(apiPresDetReq);
        let PrescribeDetails: any = [];
        let presDetail: any = {};
        if (PrescriptionDetaildata1.Data.length > 0) {
            for (let pdx in PrescriptionDetaildata1.Data) {
                presDetail = PrescriptionDetaildata1.Data[pdx];
                if (!presDetail.Morning) {
                    presDetail.Morning = '0';
                } else {
                    presDetail.Morning = presDetail.Morning;
                }
                if (!presDetail.Noon) {
                    presDetail.Noon = '0';
                } else {
                    presDetail.Noon = presDetail.Noon;
                }
                if (!presDetail.Night) {
                    presDetail.Night = '0';
                } else {
                    presDetail.Night = presDetail.Night;
                }
                PrescribeDetails.push(presDetail);
            }
        }
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: prescription.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo);
        let UserBo = BoFactory.GetBo(userbo.UserBo);
        let UserData = await UserBo.GetUserById({ Id: prescription.DoctorId });

        let patientData = await patientBo.GetPatientById({ Id: prescription.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let info = {
            Patient: patientData,
            Prescription: prescription,
            PrescriptionDetails: PrescribeDetails,
            Encounter: encounterData.Data[0],
            User: UserData,
            Preferences: printPreferencesData
        };
        //let pdfOption: any = null;
        let reportKey = 'prescription';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) pdfOption = {
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
        }; else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(reportKey, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintActiveMedication(req: BaseRequest): Promise<FileInfo> {
        let prescriptionids = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PrescriptionFilters.EncounterId, Value: req.Id },
                { Key: PrescriptionFilters.IsDischargeMedication, Value: true }
            ]
        };
        let data = await this.GetPrescriptions(apiReq);
        let prescription = data.Data[0];
        for (var idx in data.Data) {
            prescriptionids.push(data.Data[idx].Id);
        }
        //console.log(prescriptionids);
        let presDetailBo = BoFactory.GetBo(bo.PrescriptionDetailBo);
        let apiPresDetReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: [prescriptionids] }]
        };
        let PrescriptionDetaildata1 = await presDetailBo.GetPrescriptionDetails(apiPresDetReq);
        //console.log(PrescriptionDetaildata1.Data);
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: req.Id }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo);
        let UserBo = BoFactory.GetBo(userbo.UserBo);
        let UserData = await UserBo.GetUserById({ Id: prescription.DoctorId });
        let patientData = await patientBo.GetPatientById({ Id: prescription.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let info = {
            Patient: patientData,
            Prescription: prescription,
            PrescriptionDetails: PrescriptionDetaildata1.Data,
            Encounter: encounterData.Data[0],
            User: UserData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('prescription', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<PrescriptionInstance, PrescriptionAttributes> {
        return this.Models.Prescription;
    }

    public async setFollowUpPrescriptionSMS(frmFollowUpDt: Date, toFollowUpDt: Date): Promise<void> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PrescriptionFilters.ReviewDate, Value: [frmFollowUpDt, toFollowUpDt] }]
        };
        let prescribeobj = await this.GetPrescriptions(apiReq);
        await Promise.all(prescribeobj.Data.map((prescriptiondata): Promise<void> => {
            return (async (prescriberow): Promise<void> => {
                if (prescriberow.AppointmentId) {
                    console.log(prescriberow.AppointmentId); //AppointmentId
                    let apiappReq = {
                        Id: 0,
                        PageContext: { PageSize: -1, PageNumber: 1 },
                        Params: [{ Key: 0, Value: prescriberow.AppointmentId }]
                    };
                    let appBO = BoFactory.GetBo(appbo.AppointmentBo, this.Request);
                    let appobj = await appBO.GetAppointments(apiappReq);
                    await appBO.sendFollowUpPrescribedSMS(appobj.Data, frmFollowUpDt);
                }
            })(prescriptiondata);
        }));
    }
    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let PrescribeCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid,
                'PrecriptionStatusId': { '$in': [3] },  //Completed
            }
        });
        return {
            'PrescribeCount': PrescribeCount
        };
    }
}
