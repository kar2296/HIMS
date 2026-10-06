import * as SStatic from 'sequelize';
import { Op, WhereOptions } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterDoctorInstance, EncounterDoctorAttributes } from '../Model/Interface/Index';
import { EncounterDoctorFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as moment from 'moment';
import { AppointmentFilters, AppointmentDisplayFilters } from '../../Appointment/Common/Filters.e';
import * as apptbo from '../../Appointment/Business/Index';
import * as appointmentbo from '../../Appointment/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import * as Userbo from '../../SystemSettings/Business/Index';
import { PatientVitalFilters } from '../../EMR/Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as billbo from '../../Billing/Business/Index';
import { PatientBillsFilters } from '../../Billing/Common/Filters.e';
import * as Vitalbo from '../../EMR/Business/Index';
import { join } from 'path';
// import { UserAttributes } from '../../SystemSettings/Model/Interface/Index';
// import * as userbo from '../../SystemSettings/Business/Index';
export class EncounterDoctorBo extends BaseBo<EncounterDoctorInstance, EncounterDoctorAttributes>  {
    public async AddEncounterDoctor(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let apnmntInfo: any;
        let ApptDate = new Date();
        let after15mins = (ApptDate.getTime() + 15000 * 60);
        let ApptStartTime = moment(ApptDate.getTime()).format('HH:mm');
        let ApptEndTime = moment(after15mins).format('HH:mm');
        if (req.Data.AppointmentId <= 0 || !req.Data.AppointmentId) {
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    ReferralTypeId: req.Data.ReferTypeId,
                    ReferralName: req.Data.ReferralName,
                    AppointmentCategoryId: 5,
                    AppointmentDate: new Date(),
                    AppointmentStatusId: 6,
                    AppointmentTypeId: 1,
                    VisitTypeId: req.Data.VisitTypeId,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    IsEmergency: req.Data.IsEmergencyPatient,
                    PatientId: req.Data.PatientId,
                    PriorityId: 3,
                    RemarkId: req.Data.RemarkId,
                    StartTime: ApptStartTime,
                    EndTime: ApptEndTime,
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            apnmntInfo = await AppBo.Save(AppointmentData.Data);
        }
        let encDocId = result.dataValues.Id;
        if (apnmntInfo.Id) {
            let encDocUpdate: any = {
                Id: encDocId,
                AppointmentId: apnmntInfo.Id
            };
            await this.Update(encDocUpdate);
        }
        return result.dataValues.Id;
    }
    public async UpdateEncounterDoctor(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    /*
    EncounterDoctorStatus: {
        1 : Pending, (default)
        2 : Inprogress
        3 : Completed
    }
    */
    public async PrintCrossConsultation(req: BaseRequest): Promise<FileInfo> {
        // let BillNumber = req.Data.BillNumber;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterDoctorFilters.Id, Value: req.Id }]
        };
        let data = await this.GetEncounterDoctors(apiReq);
        let encDoctor = data.Data[0];
        let appReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AppointmentFilters.Id, Value: encDoctor.AppointmentId }]
        };
        let Appointmentbo = BoFactory.GetBo(apptbo.AppointmentBo, this.Request);
        let apnmntdata = await Appointmentbo.GetAppointments(appReq);
        let appointment = apnmntdata.Data[0];
        let adapiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AppointmentDisplayFilters.AppointmentId, Value: appointment.Id }]
        };
        let AppointmentDisplaybo = BoFactory.GetBo(apptbo.AppointmentDisplayBo, this.Request);
        let AppointmentDisplay =
            await AppointmentDisplaybo.GetAppointmentDisplays(adapiReq);
        let AppointmentDisplays = AppointmentDisplay.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: appointment.PatientId });
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: encDoctor.DoctorId }]
        };
        let userBo = BoFactory.GetBo(Userbo.UserBo, this.Request);
        let userData = await userBo.GetUsers(userReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: encDoctor.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let EncInfo = encounterData.Data[0];
        let billReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: EncInfo.Id }]
        };
        let billBO = BoFactory.GetBo(billbo.PatientBillsBo, this.Request);
        let billData = await billBO.GetPatientBills(billReq);
        let BillNumber: any = '';
        if (billData.Data.length > 0) {
            let BillInfo = billData.Data[0];
            BillNumber = BillInfo.BillNumber;
        }
        let vitalReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientVitalFilters.PatientId, Value: appointment.PatientId },
            { Key: PatientVitalFilters.EncounterId, Value: EncInfo.Id }]
        };
        let patientvitalBo = BoFactory.GetBo(Vitalbo.PatientVitalBo, this.Request);
        let patientvitalData = await patientvitalBo.GetPatientVitals(vitalReq);
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(appointment.FacilityId);
        let info = {
            Appointment: appointment,
            EncounterDoctor: encDoctor,
            BillNumber: BillNumber,
            AppointmentDisplay: AppointmentDisplays,
            Patient: patientData,
            Encounter: encounterData.Data[0],
            user: userData.Data[0],
            patientvital: patientvitalData.Data,
            Preferences: printPreferencesData
        };
        let key = 'opvisit';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.1in',
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async ManageEncounterDoctor(req: BaseRequest): Promise<number> {
        let appointment = req.Data;
        //check if exists
        let encounterDoctorId = await this.GetEncounterDoctorIdByFilter(req); if (encounterDoctorId === -1) {
            let encounterDoctor: any = {
                PatientId: appointment.PatientId,
                EncounterId: appointment.EncounterId,
                EncounterConsulationId: null,
                AppointmentId: appointment.Id,
                VisitIdentifier: null,
                ConsultationNumber: null,
                DoctorId: appointment.AssignedUserId,
                DoctorName: appointment.AssignedUserName,
                DepartmentId: appointment.DepartmentId,
                SpecialityId: null,
                FacilityId: appointment.FacilityId,
                OrganizationId: null,
                StartDate: new Date(),
                EndDate: null,
                TokenNumber: null,
                ReferralId: null,
                ClinicalStaffId: null,
                AdmitReason: appointment.Remarks,
                IsEmergencyVisit: appointment.IsEmergency,
                IsPrimary: true,
                EncounterDoctorStatus: 1 //Pending
            };
            let result = await this.Save(encounterDoctor);
            encounterDoctorId = result.dataValues.Id;
        }
        if (req.Data.updateAppointment === true) {
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            let appointReq: any = { 'AppointmentStatusId': 6 };
            await AppBo.Update(appointReq, {
                fields: ['AppointmentStatusId'],
                where: { 'AppointmentId': req.Data.Id },
            });
        }
        return encounterDoctorId;
    }
    public async ManageAppEncounterDoctor(req: BaseRequest): Promise<number> {
        let appointment = req.Data;
        //check if exists
        let encounterDoctorId: any;
        encounterDoctorId = await this.GetEncounterDoctorIdByFilter(req);
        if (encounterDoctorId === -1) {
            let encounterDoctor: any = {
                PatientId: appointment.PatientId,
                EncounterId: appointment.EncounterId,
                EncounterConsulationId: null,
                AppointmentId: appointment.Id,
                VisitIdentifier: null,
                ConsultationNumber: null,
                DoctorId: appointment.AssignedUserId,
                DoctorName: appointment.AssignedUserName,
                DepartmentId: appointment.DepartmentId,
                SpecialityId: null,
                FacilityId: appointment.FacilityId,
                VirtualOrderId: appointment.VirtualOrderId,
                OrganizationId: null,
                StartDate: new Date(),
                EndDate: null,
                TokenNumber: null,
                ReferralId: null,
                ClinicalStaffId: null,
                AdmitReason: appointment.Remarks,
                IsPrimary: true,
                IsVirtualConsultation: true,
                EncounterDoctorStatus: 1 //Pending
            };
            let result = await this.Save(encounterDoctor);
            encounterDoctorId = result.dataValues.Id;
        }
        return encounterDoctorId;
    }
    public async ManageupdateEncounterDoctor(req: BaseRequest, OrderId: number): Promise<number> {
        let appointment = req.Data;
        //check if exists
        let encounterDoctorId: any;
        let encounterDoctor: any = {
            PatientId: appointment.PatientId,
            EncounterId: appointment.EncounterId,
            EncounterConsulationId: null,
            AppointmentId: appointment.Id,
            VisitIdentifier: null,
            ConsultationNumber: null,
            DoctorId: appointment.DoctorId,
            DoctorName: appointment.AssignedUserName,
            DepartmentId: appointment.DepartmentId,
            SpecialityId: null,
            FacilityId: appointment.FacilityId,
            OrderConsultTypeId: appointment.OrderConsultTypeId,
            VirtualOrderId: OrderId,
            OrganizationId: null,
            StartDate: new Date(),
            EndDate: null,
            TokenNumber: null,
            ReferralId: null,
            ClinicalStaffId: null,
            AdmitReason: appointment.Remarks,
            IsPrimary: true,
            EncounterDoctorStatus: 1 //Pending
        };
        let result = await this.Save(encounterDoctor);
        encounterDoctorId = result.dataValues.Id;
        return encounterDoctorId;
    }
    public async AssignEncounterDoctor(req: BaseRequest): Promise<number> {
        let encounterDoctorId = -1;
        let assignInfo = req.Data;
        //checkout his record
        let updateInfo: any = {
            EndDate: new Date(),
            EncounterDoctorStatus: 3 //Checkout
        };
        if (!assignInfo.EncounterId) {
            let encBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            assignInfo.EncounterId = await encBo.GetEncounterIdForAppointment(assignInfo.AppointmentId);
        }
        await this.Update(updateInfo, {
            fields: ['EndDate', 'EncounterDoctorStatus'],
            where: {
                PatientId: assignInfo.PatientId,
                EncounterId: assignInfo.EncounterId,
                AppointmentId: assignInfo.AppointmentId,
                DoctorId: this.Session.UserId,
                EncounterDoctorStatus: 2 //Inprogress
            }
        });
        //create new entry for assignee
        let encounterDoctor: any = {
            PatientId: assignInfo.PatientId,
            EncounterId: assignInfo.EncounterId,
            EncounterConsulationId: null,
            AppointmentId: assignInfo.AppointmentId,
            VisitIdentifier: null,
            ConsultationNumber: null,
            DoctorId: assignInfo.AssignedUserId,
            DoctorName: assignInfo.AssignedUserName,
            DepartmentId: assignInfo.AssignedUserDepartmentId,
            SpecialityId: null,
            FacilityId: assignInfo.FacilityId,
            OrganizationId: null,
            StartDate: assignInfo.FollowupAppointmentOn || new Date(),
            EndDate: null,
            TokenNumber: null,
            ReferralId: null,
            ClinicalStaffId: null,
            AdmitReason: assignInfo.Remarks,
            IsPrimary: true,
            EncounterDoctorStatus: 1 //Pending
        };
        let result = await this.Save(encounterDoctor);
        encounterDoctorId = result.dataValues.Id;
        return encounterDoctorId;
    }
    public async AttendEncounterDoctor(req: BaseRequest): Promise<number> {
        let attendInfo = req.Data;
        let updateInfo: any = {
            StartDate: new Date(),
            EncounterDoctorStatus: 2
        };
        let updated = await this.Update(updateInfo, {
            fields: ['StartDate', 'EncounterDoctorStatus'],
            where: {
                PatientId: attendInfo.PatientId,
                AppointmentId: attendInfo.AppointmentId,
                // DoctorId: this.Session.UserId
            }
        });
        return updated ? 0 : -1;
    }
    public async CheckoutEncounterDoctor(req: BaseRequest): Promise<number> {
        let checkoutInfo = req.Data;
        let updateInfo: any = {
            EndDate: new Date(),
            EncounterDoctorStatus: 3
        };
        if (checkoutInfo.DoctorId && Number(checkoutInfo.DoctorId) > 0 && checkoutInfo.EncounterId && Number(checkoutInfo.EncounterId) > 0) {
            let updated = await this.Update(updateInfo, {
                fields: ['EndDate', 'EncounterDoctorStatus'],
                where: {
                    PatientId: checkoutInfo.PatientId,
                    DoctorId: checkoutInfo.DoctorId,
                    EncounterId: checkoutInfo.EncounterId
                }
            });
            return updated ? 0 : -1;
        } else if (checkoutInfo.EncounterId && Number(checkoutInfo.EncounterId) > 0) {
            let updated = await this.Update(updateInfo, {
                fields: ['EndDate', 'EncounterDoctorStatus'],
                where: {
                    PatientId: checkoutInfo.PatientId,
                    EncounterId: checkoutInfo.EncounterId
                }
            });
            return updated ? 0 : -1;
        } else {
            let whereClause: any = { PatientId: checkoutInfo.PatientId };
            if (checkoutInfo.AppointmentId) whereClause.AppointmentId = checkoutInfo.AppointmentId;
            let updated = await this.Update(updateInfo, {
                fields: ['EndDate', 'EncounterDoctorStatus'],
                where: whereClause
            });
            return updated ? 0 : -1;
        }
    }
    public async AutoCheckoutEncounterDoctor(checkoutInfo: any): Promise<number> {
        let updateInfo: any = {
            EndDate: new Date(),
            EncounterDoctorStatus: 3
        };
        let updated = await this.Update(updateInfo, {
            fields: ['EndDate', 'EncounterDoctorStatus'],
            where: {
                PatientId: checkoutInfo.PatientId,
                AppointmentId: checkoutInfo.AppointmentId,
                // DoctorId: this.Session.UserId
            }
        });
        return updated ? 0 : -1;
    }
    public async GetEncounterDoctorIdByFilter(req: BaseRequest): Promise<number> {
        let encounterDoctorId: number = -1;
        let filterInfo = req.Data;
        let encounterDoctorInstance: any = await this.Find({
            where: {
                PatientId: filterInfo.PatientId,
                EncounterId: filterInfo.EncounterId,
                DoctorId: filterInfo.AssignedUserId
            },
            attributes: ['Id']
        });
        if (encounterDoctorInstance) {
            let encounterDoctor = this.GetAttribute(encounterDoctorInstance);
            encounterDoctorId = encounterDoctor.Id;
        }
        return encounterDoctorId;
    }
    public async GetEncounterDoctorById(req: BaseRequest): Promise<EncounterDoctorAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetTransferEncounterDoctors(apiReq?: ApiRequest<EncounterDoctorFilters>):
        Promise<ApiResponse<EncounterDoctorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patQryJoin: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientSearch: boolean = false;
        let order: Array<any> = [];
        let encQryJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'VisitIdentifier', 'AdmissionDate', 'DischargeDate',
                'EncounterTypeId', 'EncounterStatusId', 'DoctorId', 'DepartmentId', 'TeamId', 'VisitTypeId', 'RemarkId'],
            where: {
                'IsLatest': true
            },
            include: [this.GetReference('VisitType'),
            {
                model: this.Models.UserTeam, required: false,
                include: [this.GetReference('Team')]
            },
            { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }],
            required: true
        };
        let encounterQryJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'VisitIdentifier', 'AdmissionDate', 'DischargeDate',
                'EncounterTypeId', 'EncounterStatusId', 'DoctorId', 'DepartmentId', 'TeamId', 'VisitTypeId', 'RemarkId'],
            include: [this.GetReference('VisitType'),
            {
                model: this.Models.UserTeam, required: false,
                include: [this.GetReference('Team')]
            },
            { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }],
            required: true
        };
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'LandLine', 'Email', 'RemarkId'],
            required: isReqPatientSearch,
            where: patQryJoin,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus'),
            { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'OPDRoomId'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ConsultationStatus'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case EncounterDoctorFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterDoctorFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case EncounterDoctorFilters.AppointmentStatus:
                    let existing = where['EncounterDoctorStatus'];
                    let apptStatus = param.Value;
                    if (apptStatus.AppointmentStatus === 6) {
                        where['EncounterDoctorStatus'] = existing || { [Op.in]: [1, 2] }; //Pending or Inprogress
                        include.push(encQryJoin);
                    }
                    if (apptStatus.AppointmentStatus === 11) {
                        where['EncounterDoctorStatus'] = existing || 3; //Completed
                        include.push(encounterQryJoin);
                    }
                    console.log('User Session');
                    console.log(this.Session.UserId);
                    if (apptStatus.My) {
                        where['DoctorId'] = this.Session.UserId;
                    }
                    break;
                case EncounterDoctorFilters.PatientName:
                    (patQryJoin as any)[Op.or] = [
                        { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'MiddleName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { [Op.like]: '%' + (param.Value || '') } }
                    ];
                    isReqPatientSearch = true;
                    break;
                case EncounterDoctorFilters.ConsultationStatus:
                    if (param.Value && param.Value !== -1) {
                        where['EncounterDoctorStatus'] = param.Value;
                    }
                    break;
                case EncounterDoctorFilters.VisitDate:
                    if (param.Value) {
                        where['StartDate'] = {
                            [Op.or]:
                            {
                                [Op.between]: param.Value,
                                [Op.gt]: null
                            }
                        };
                    }
                    break;
                case EncounterDoctorFilters.AdmissionDate:
                    encQryJoin['where'] = [
                        { 'AdmissionDate': { [Op.between]: param.Value || '' }, 'IsLatest': true }
                    ];
                    encQryJoin['required'] = true;
                    break;
                case EncounterDoctorFilters.StartDate:
                    encounterQryJoin['where'] = [
                        { 'AdmissionDate': { [Op.between]: param.Value || '' }, 'IsLatest': false }
                    ];
                    encounterQryJoin['required'] = true;
                    break;
                case EncounterDoctorFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case EncounterDoctorFilters.AppointmentId:
                    where['AppointmentId'] = param.Value;
                    break;
                case EncounterDoctorFilters.OPOnly:
                    encQryJoin['where'] = [
                        { 'AdmissionDate': { [Op.between]: param.Value || '' }, 'EncounterTypeId': 1, 'IsLatest': true }
                    ];
                    encQryJoin['required'] = true;
                    break;
                case EncounterDoctorFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                case EncounterDoctorFilters.DepartmentId:
                    where['DepartmentId'] = param.Value;
                    break;
                case EncounterDoctorFilters.DoctorId:
                    where['DoctorId'] = param.Value;
                    break;
                case EncounterDoctorFilters.TeamId:
                    encQryJoin['where'] = [
                        { 'TeamId': param.Value, 'IsLatest': true }
                    ];
                    encQryJoin['required'] = true;
                    break;
                // case EncounterDoctorFilters.VisitTypeId:
                //     ApptWhere['VisitTypeId'] = param.Value;
                //     isReqAppttSearch = true;
                //     break;
                case EncounterDoctorFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case EncounterDoctorFilters.VisitStartDate:
                    where['StartDate'] = { [Op.between]: param.Value || '' };
                    break;
                case EncounterDoctorFilters.From:
                    where['StartDate'] = where['StartDate'] || {};
                    (where['StartDate'] as any)[Op.gte] = param.Value;
                    break;
                case EncounterDoctorFilters.To:
                    where['StartDate'] = where['StartDate'] || {};
                    (where['StartDate'] as any)[Op.lte] = param.Value + ' 23:59:59';
                    break;
                case EncounterDoctorFilters.EncounterTypeId:
                    encounterQryJoin['where'] = [
                        { 'EncounterTypeId': { [Op.eq]: param.Value || '' } }
                    ];
                    encounterQryJoin['required'] = true;
                    break;
                case EncounterDoctorFilters.EncounterType:
                    encQryJoin['where'] = [
                        { 'EncounterTypeId': { [Op.eq]: param.Value || '' } }
                    ];
                    encQryJoin['required'] = true;
                    break;
                case EncounterDoctorFilters.EncounterStatusId:
                    encQryJoin['where'] = [
                        { 'EncounterStatusId': { [Op.eq]: param.Value || '' } }
                    ];
                    encQryJoin['required'] = true;
                    break;
                case EncounterDoctorFilters.IsVirtualConsultation:
                    where['IsVirtualConsultation'] = param.Value;
                    break;
                case EncounterDoctorFilters.VirtualCategoryId:
                    where['VirtualCategoryId'] = param.Value;
                    break;
                case EncounterDoctorFilters.EncDoctorStatus:
                    if (param.Value) {
                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        where['EncounterDoctorStatus'] = { [Op.in]: paramArr };
                    }
                    break;
                case EncounterDoctorFilters.IsEmergencyVisit:
                    where['IsEmergencyVisit'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        // include.push({
        //     model: this.Models.Appointment,
        //     required: isReqAppttSearch,
        //     where: ApptWhere,
        //     include: [{
        //         model: this.Models.AppointmentDisplay, required: false,
        //         include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        //     }, this.GetReference('VisitType')]
        // });
        order.push(['StartDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetEncounterDoctors(apiReq?: ApiRequest<EncounterDoctorFilters>): Promise<ApiResponse<EncounterDoctorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patQryJoin: WhereOptions<any> = {};
        let ApptWhere: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqAppttSearch, isReqPatientSearch: boolean = false;
        let order: Array<any> = [];
        // let encQryJoin: any = {
        //     model: this.Models.Encounter,
        //     attributes: ['Id', 'VisitIdentifier', 'AdmissionDate',
        //     'DischargeDate',
        //         'EncounterTypeId', 'EncounterStatusId',
        //         'DoctorId', 'DepartmentId', 'TeamId',
        //         'VisitTypeId', 'RemarkId', 'BillingRemarks',
        //         'BillingStatusId'],
        //     where: {
        //         'IsLatest': true
        //     },
        //     include: [this.GetReference('VisitType'), this.GetReference('BillingStatus'),
        //     {
        //         model: this.Models.UserTeam, required: false,
        //         include: [this.GetReference('Team')]
        //     },
        //     { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }],
        //     required: true
        // };
        // include.push({
        //     model: this.Models.Patient,
        //     attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
        //         'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
        //         'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'LandLine', 'Email', 'RemarkId',
        //         'FamilyUniqueId', 'RegisteredDate'],
        //     required: isReqPatientSearch,
        //     where: patQryJoin,
        //     include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus'),
        //     { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }]
        // });
        // // let patQryJoin: any = {
        // //     model: this.Models.Patient,
        // //     where: {
        // //     },
        // //     required: true,
        // //     include: [this.GetReference('Title'), this.GetReference('Gender')]
        // // };
        // include.push({
        //     model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'OPDRoomId'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ConsultationStatus'));
        let apptStatus: any;
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case EncounterDoctorFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterDoctorFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case EncounterDoctorFilters.AppointmentStatus:
                    //input:
                    //my checkedin { AppointmentStatus: 6, My: true }
                    //all checkedin { AppointmentStatus: 6, My: false }
                    //previous visits { AppointmentStatus: 11, My: true }
                    // include.push(patQryJoin);
                    let existing = where['EncounterDoctorStatus'];
                    apptStatus = param.Value;
                    if (apptStatus.AppointmentStatus === 6) {
                        where['EncounterDoctorStatus'] = existing || { [Op.in]: [1, 2, 3] }; //Pending or Inprogress
                        //include.push(encQryJoin);
                    }
                    if (apptStatus.AppointmentStatus === 11) {
                        where['EncounterDoctorStatus'] = existing || 3; //Completed
                        // include.push(encounterQryJoin);
                    }
                    console.log('User Session');
                    console.log(this.Session.UserId);
                    if (apptStatus.My) {
                        // if(this.Session.UserId !== 1) {
                        //     where['DoctorId'] = this.Session.UserId;
                        // }
                        if (this.Session.UserTypeId === 2) {
                            where['DoctorId'] = this.Session.UserId;
                        }
                    }
                    break;
                case EncounterDoctorFilters.PatientName:
                    (patQryJoin as any)[Op.or] = [
                        { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'MiddleName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { [Op.like]: '%' + (param.Value || '') } }
                    ];
                    isReqPatientSearch = true;
                    break;
                case EncounterDoctorFilters.ConsultationStatus:
                    if (param.Value && param.Value !== -1) {
                        where['EncounterDoctorStatus'] = param.Value;
                    }
                    break;
                case EncounterDoctorFilters.VisitDate:
                    if (param.Value) {
                        where['StartDate'] = {
                            [Op.or]:
                            {
                                [Op.between]: param.Value,
                                [Op.gt]: null
                            }
                        };
                    }
                    break;
                case EncounterDoctorFilters.AdmissionDate:
                    // encQryJoin['where'] = [
                    //     { 'AdmissionDate': { '$between': param.Value || '' }, 'IsLatest': true }
                    // ];
                    // encQryJoin['required'] = true;
                    encounterWhere['AdmissionDate'] = { [Op.between]: param.Value || '' };
                    break;
                case EncounterDoctorFilters.StartDate:
                    // encounterQryJoin['where'] = [
                    //     { 'AdmissionDate': { '$between': param.Value || '' }, 'IsLatest': false }
                    // ];
                    // encounterQryJoin['required'] = true;
                    encounterWhere['AdmissionDate'] = { [Op.between]: param.Value || '' };
                    break;
                case EncounterDoctorFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case EncounterDoctorFilters.AppointmentId:
                    where['AppointmentId'] = param.Value;
                    break;
                case EncounterDoctorFilters.OPOnly:
                    // encQryJoin['where'] = [
                    //     { 'AdmissionDate': { '$between': param.Value || '' }, 'EncounterTypeId': 1, 'IsLatest': true }
                    // ];
                    // encQryJoin['required'] = true;
                    encounterWhere['AdmissionDate'] = { [Op.between]: param.Value || '' };
                    encounterWhere['EncounterTypeId'] = 1;
                    encounterWhere['IsLatest'] = true;
                    break;
                case EncounterDoctorFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                case EncounterDoctorFilters.DepartmentId:
                    where['DepartmentId'] = param.Value;
                    break;
                case EncounterDoctorFilters.DoctorId:
                    where['DoctorId'] = param.Value;
                    break;
                case EncounterDoctorFilters.TeamId:
                    // encQryJoin['where'] = [
                    //     { 'TeamId': param.Value, 'IsLatest': true }
                    // ];
                    // encQryJoin['required'] = true;
                    encounterWhere['TeamId'] = param.Value;
                    break;
                case EncounterDoctorFilters.VisitTypeId:
                    ApptWhere['VisitTypeId'] = param.Value;
                    isReqAppttSearch = true;
                    break;
                case EncounterDoctorFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case EncounterDoctorFilters.VisitStartDate:
                    if (param.Value !== null) {
                        where['StartDate'] = { [Op.between]: param.Value || '' };
                    }
                    break;
                case EncounterDoctorFilters.From:
                    where['StartDate'] = where['StartDate'] || {};
                    (where['StartDate'] as any)[Op.gte] = param.Value;
                    break;
                case EncounterDoctorFilters.To:
                    where['StartDate'] = where['StartDate'] || {};
                    (where['StartDate'] as any)[Op.lte] = param.Value + ' 23:59:59';
                    break;
                case EncounterDoctorFilters.EncounterTypeId:
                    // encounterQryJoin['where'] = [
                    //     { 'EncounterTypeId': { '$eq': param.Value || '' } }
                    // ];
                    // encounterQryJoin['required'] = true;
                    encounterWhere['EncounterTypeId'] = param.Value;
                    break;
                case EncounterDoctorFilters.EncounterType:
                    // encQryJoin['where'] = [
                    //     { 'EncounterTypeId': { '$eq': param.Value || '' } }
                    // ];
                    // encQryJoin['required'] = true;
                    encounterWhere['EncounterTypeId'] = param.Value;
                    break;
                case EncounterDoctorFilters.EncounterStatusId:
                    // encQryJoin['where'] = [
                    //     { 'EncounterStatusId': { '$eq': param.Value || '' } }
                    // ];
                    // encQryJoin['required'] = true;
                    if (param.Value) {
                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        encounterWhere['EncounterStatusId'] = { [Op.in]: paramArr };
                    }
                    // encounterWhere['EncounterStatusId'] = param.Value;
                    break;
                case EncounterDoctorFilters.IsVirtualConsultation:
                    where['IsVirtualConsultation'] = param.Value;
                    break;
                case EncounterDoctorFilters.VirtualCategoryId:
                    where['VirtualCategoryId'] = param.Value;
                    break;
                case EncounterDoctorFilters.BillingStatusId:
                    encounterWhere['BillingStatusId'] = param.Value;
                    break;
                case EncounterDoctorFilters.EncDoctorStatus:
                    if (param.Value) {
                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        where['EncounterDoctorStatus'] = { [Op.in]: paramArr };
                    }
                    break;
                case EncounterDoctorFilters.IsEmergencyVisit:
                    where['IsEmergencyVisit'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        include.push({
            model: this.Models.Appointment,
            attributes: ['AppointmentId', 'AppointmentDate', 'VisitTypeId'],
            required: isReqAppttSearch,
            where: ApptWhere,
            include: [{
                model: this.Models.AppointmentDisplay,
                attributes: ['AppointmentDisplayId', 'TokenStatusId', 'TokenNo'],
                required: false,
                include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
            },
            {
                model: this.Models.PatientTracker, required: false,
                attributes: ['PatientTrackerId', 'AppointmentId', 'EncounterId', 'FollowupAppointmentOn', 'TrackerNotes'],
            }, this.GetReference('VisitType')]
        });
        let encounterQryJoin: any = {
            model: this.Models.Encounter,
            attributes: ['Id', 'VisitIdentifier', 'AdmissionDate',
                'DischargeDate',
                'EncounterTypeId', 'EncounterStatusId',
                'DoctorId', 'DepartmentId',
                'TeamId', 'VisitTypeId',
                'RemarkId', 'BillingStatusId',
                'BillingRemarks', 'IsLatest', 'DiagnosisId'],
            include: [this.GetReference('VisitType'),
            this.GetReference('BillingStatus'),
            {
                model: this.Models.UserTeam, required: false,
                include: [this.GetReference('Team')]
            },
            { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false },
            { model: this.Models.Diagnosis, as: 'Diagnosis', attributes: ['DiagnosisName'], required: false },
            { model: this.Models.PatientCondition, attributes: ['Id', 'DiagnosisId', 'DiagnosisName', 'OtherDiagnosis'], required: false },
            ],
            where: encounterWhere,
            required: true
        };
        include.push(encounterQryJoin);
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'LandLine', 'Email', 'RemarkId',
                'FamilyUniqueId', 'RegisteredDate'],
            required: isReqPatientSearch,
            where: patQryJoin,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus'),
            { model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'OPDRoomId'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        order.push(['StartDate', 'DESC']);
        // return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
        return await this.FindAndCount(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetServiceEncounterDoctors(apiReq?: ApiRequest<EncounterDoctorFilters>):
        Promise<ApiResponse<EncounterDoctorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patQryJoin: WhereOptions<any> = {};
        let Orderwhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientSearch, isReqOrderSearch: boolean = false;
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'OPDRoomId'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ConsultationStatus'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case EncounterDoctorFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterDoctorFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case EncounterDoctorFilters.PatientName:
                    (patQryJoin as any)[Op.or] = [
                        { 'FirstName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'MiddleName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'LastName': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'MRN': { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { [Op.like]: '%' + (param.Value || '') } }
                    ];
                    isReqPatientSearch = true;
                    break;
                case EncounterDoctorFilters.ConsultationStatus:
                    if (param.Value && param.Value !== -1) {
                        where['EncounterDoctorStatus'] = param.Value;
                    }
                    break;
                case EncounterDoctorFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case EncounterDoctorFilters.AppointmentId:
                    where['AppointmentId'] = param.Value;
                    break;
                case EncounterDoctorFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                case EncounterDoctorFilters.DepartmentId:
                    where['DepartmentId'] = param.Value;
                    break;
                case EncounterDoctorFilters.DoctorId:
                    where['DoctorId'] = param.Value;
                    break;
                case EncounterDoctorFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case EncounterDoctorFilters.IsVirtualConsultation:
                    where['IsVirtualConsultation'] = param.Value;
                    break;
                case EncounterDoctorFilters.VirtualCategoryId:
                    where['VirtualCategoryId'] = param.Value;
                    break;
                case EncounterDoctorFilters.OrderRequestDate:
                    Orderwhere['OrderRequestDate'] = { [Op.between]: param.Value || '' };
                    isReqOrderSearch = true;
                    break;
                case EncounterDoctorFilters.FromOrderReq:
                    Orderwhere['OrderRequestDate'] = Orderwhere['OrderRequestDate'] || {};
                    (Orderwhere['OrderRequestDate'] as any)[Op.gte] = param.Value;
                    isReqOrderSearch = true;
                    break;
                case EncounterDoctorFilters.ToOrderReq:
                    Orderwhere['OrderRequestDate'] = Orderwhere['OrderRequestDate'] || {};
                    (Orderwhere['OrderRequestDate'] as any)[Op.lte] = param.Value;
                    isReqOrderSearch = true;
                    break;
                case EncounterDoctorFilters.OrderScheduleDate:
                    Orderwhere['OrderScheduleDate'] = { [Op.between]: param.Value || '' };
                    isReqOrderSearch = true;
                    break;
                case EncounterDoctorFilters.FromOrderSch:
                    Orderwhere['OrderScheduleDate'] = Orderwhere['OrderScheduleDate'] || {};
                    (Orderwhere['OrderScheduleDate'] as any)[Op.gte] = param.Value;
                    isReqOrderSearch = true;
                    break;
                case EncounterDoctorFilters.ToOrderSch:
                    Orderwhere['OrderScheduleDate'] = Orderwhere['OrderScheduleDate'] || {};
                    (Orderwhere['OrderScheduleDate'] as any)[Op.lte] = param.Value;
                    isReqOrderSearch = true;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        order.push(['StartDate', 'DESC']);
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'LandLine', 'Email'],
            required: isReqPatientSearch,
            where: patQryJoin,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.VirtualOrder,
            required: isReqOrderSearch,
            where: Orderwhere,
            include: [this.GetReference('VirtualOrderStatus')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteEncounterDoctor(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let checkedincount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterDoctorStatus': { [Op.in]: [1, 2] },
                'DoctorId': req.Data.DoctorId,
                'StartDate': { [Op.gte]: req.Data.FromDate, [Op.lte]: req.Data.ToDate },
            }, include: [{
                model: this.Models.Encounter,
                attributes: ['Id'],
                where: {
                    'EncounterTypeId': 1
                },
                required: true
            }]
        });
        return {
            'checkedincount': checkedincount,
        };
    }
    public async GetFacilityVirtualDashBoard(req: BaseRequest): Promise<any> {
        let pendingCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterDoctorStatus': { [Op.in]: [1, 2] },
                'StartDate': { [Op.gte]: req.Data.FromDate, [Op.lte]: req.Data.ToDate },
                'DoctorId': req.Data.DoctorId,
            }, include: [{
                model: this.Models.Encounter,
                attributes: ['Id'],
                where: {
                    'EncounterTypeId': 1,
                    'IsLatest': true
                },
                required: true
            }]
        });
        let completedCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterDoctorStatus': { [Op.in]: [3] },
                'StartDate': { [Op.gte]: req.Data.FromDate, [Op.lte]: req.Data.ToDate },
                'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'PendingCount': pendingCount,
            'CompletedCount': completedCount,
        };
    }
    public async GetEncounterDoctorByAdmission(req: BaseRequest): Promise<number> {
        let encounterDoctorId: number = -1;
        let filterInfo = req.Data;
        let encounterDoctorInstance: any = await this.Find({
            where: {
                PatientId: filterInfo.PatientId,
                EncounterId: filterInfo.EncounterId,
                EncounterDoctorStatus: 2
            },
            attributes: ['Id']
        });
        if (encounterDoctorInstance) {
            let encounterDoctor = this.GetAttribute(encounterDoctorInstance);
            encounterDoctorId = encounterDoctor.Id;
        }
        return encounterDoctorId;
    }
    public async ManageAdmissionDoctor(req: BaseRequest): Promise<number> {
        let admission = req.Data;
        //check and update existing doctor status to completed
        let encounterDoctorInstance = await this.Find({
            where: {
                PatientId: req.Data.PatientId,
                EncounterId: req.Data.EncounterId,
                EncounterDoctorStatus: 2
            },
            attributes: ['Id']
        });
        if (encounterDoctorInstance) {
            let doctor = this.GetAttribute(encounterDoctorInstance);
            doctor.EndDate = new Date();
            doctor.EncounterDoctorStatus = 3;//Checkout
            await this.Update(doctor, {
                fields: ['EndDate', 'EncounterDoctorStatus'],
                where: {
                    PatientId: admission.PatientId,
                    EncounterId: admission.Id,
                    DoctorId: doctor.DoctorId
                }
            });
        }
        //check if exists
        let encounterDoctorId = await this.GetEncounterDoctorByAdmission(req);
        if (encounterDoctorId === -1) {
            let encounterDoctor: any = {
                PatientId: admission.PatientId,
                EncounterId: admission.Id,
                EncounterConsulationId: null,
                VisitIdentifier: null,
                ConsultationNumber: null,
                DoctorId: admission.DoctorId,
                DoctorName: admission.DoctorName,
                DepartmentId: admission.DepartmentId,
                SpecialityId: null,
                FacilityId: admission.FacilityId,
                OrganizationId: null,
                StartDate: new Date(),
                EndDate: null,
                TokenNumber: null,
                ReferralId: null,
                ClinicalStaffId: null,
                AdmitReason: admission.Remarks,
                IsPrimary: true,
                EncounterDoctorStatus: 2 //InProgress
            };
            let result = await this.Save(encounterDoctor);
            encounterDoctorId = result.dataValues.Id;
        }
        return encounterDoctorId;
    }
    // public async getUserName(UserData: UserAttributes): Promise<string> {
    //     let vDocName = '';
    //     if (UserData) {
    //         if (UserData.FirstName) vDocName += UserData.FirstName;
    //         if (UserData.LastName) vDocName += ' ' + UserData.LastName;
    //         // let apiReqTitle = {
    //         //     Id: 0,
    //         //     PageContext: { PageSize: 50, PageNumber: 1 },
    //         //     Params: [
    //         //         { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
    //         //         { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: UserData.TitleId }
    //         //     ]
    //         // };
    //         // let vTitleName = '';
    //         // let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
    //         // let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
    //         // if (TitleData.Data) {
    //         //     if (TitleData.Data.length > 0) {
    //         //         if (TitleData.Data[0].Description)
    //         //             vTitleName = TitleData.Data[0].Description;
    //         //     }
    //         // }
    //         // if (vTitleName)
    //         //     vDocName = vTitleName + '.' + vDocName;
    //     }
    //     return vDocName;
    // }
    public async ManageIPEncounterDoctor(req: BaseRequest): Promise<boolean> {
        let details = req.Data.Details || [];
        await Promise.all(details.map((DetailItem: any): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.EncounterId = req.Data.EncounterId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        let encBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterData: any = {
            Data: {
                Id: req.Data.EncounterId,
                DoctorId: req.Data.DoctorId,
                DepartmentId: req.Data.DepartmentId
            }
        };
        await encBo.UpdateEncounter(EncounterData);
        return true;
    }
    public GetModel(): SStatic.Model<EncounterDoctorInstance, EncounterDoctorAttributes> {
        return this.Models.EncounterDoctor;
    }
}
