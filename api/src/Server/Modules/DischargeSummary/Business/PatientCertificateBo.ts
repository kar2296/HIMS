import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientCertificateInstance, PatientCertificateAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientCertificateFilters } from '../Common/Filters.e';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as regbo from '../../Registration/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import { PrescriptionFilters, PrescriptionDetailFilters } from '../../EMR/Common/Filters.e';
import { PatientTrackerFilters } from '../../Appointment/Common/Filters.e';
import { FacilityPreferenceFilters } from '../../SystemSettings/Common/Filters.e';
import * as PrescriptionBo from '../../EMR/Business/Index';
import * as PrescriptionDetailBo from '../../EMR/Business/Index';
import * as PatientTrackerBo from '../../Appointment/Business/Index';
import * as OtManagementBo from '../../OtManagement/Business/Index';
import { SurgeryEntryFilters } from '../../OtManagement/Common/Filters.e';
import { join } from 'path';
import * as moment from 'moment';

export class PatientCertificateBo extends BaseBo<PatientCertificateInstance, PatientCertificateAttributes> implements IOptionProvider {
    public async AddPatientCertificate(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.DischargeTypeId = req.Data.DischargeTypeId;
        await encounterbo.Update(EncounterInfo);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientCertificate(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.DischargeTypeId = req.Data.DischargeTypeId;
        await encounterbo.Update(EncounterInfo);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientCertificateById(req: BaseRequest): Promise<PatientCertificateAttributes> {
        let include: Array<IncludeOptions> = [];

        include.push(this.GetReference('CertificateStatus'));
        include.push(this.GetReference('AdmissionStatus'));
        include.push({
            model: this.Models.Encounter, attributes: ['EncounterId', 'AppointmentId', 'VisitIdentifier',
                'EncounterTypeId', 'AdmissionDate', 'DischargeDate', 'EncounterStatusId',
                'DoctorName', 'GuarantorId', 'AdmissionStatusId', 'TeamId', 'IsBillLock'],
            required: false,
            include: [this.GetReference('AdmissionStatus')]
        });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomName', 'RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], as: 'AprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedByUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });

        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: true,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });

        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientCertificates(apiReq?: ApiRequest<PatientCertificateFilters>):
        Promise<ApiResponse<PatientCertificateAttributes[]>> {
        let where: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('CertificateStatus'));
        include.push(this.GetReference('AdmissionStatus'));
        // include.push({ model: this.Models.Encounter, attributes: ['AdmissionStatus'], required: false });
        include.push(this.GetReference('DischargeType'));
        include.push(this.GetReference('NoteType'));
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], as: 'AprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['EncounterId', 'AppointmentId', 'VisitIdentifier', 'EncounterTypeId',
                'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId', 'IsBillLock'],
            required: false, where: { 'IsLatest': true },
            include: [{
                model: this.Models.UserTeam, attributes: ['TeamId'], required: false,
                include: [
                    this.GetReference('Team')
                ]
            },
            { model: this.Models.Remark, attributes: ['Remarks'], as: 'VisitReason', required: false }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedByUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.Guarantor, attributes: ['Id', 'GuarantorName', 'Code'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientCertificateFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    // case PatientCertificateFilters.CertificateStatus:
                    //     where['CertificateStatusId'] = param.Value;
                    //     break;
                    case PatientCertificateFilters.CertificateStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['CertificateStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientCertificateFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientCertificateFilters.Name:
                        (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': (param.Value || '') } },
                        { 'Mobile': { '$like': (param.Value || '') } }];
                        break;
                    case PatientCertificateFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientCertificateFilters.DischargeDate:
                        where['DischargeDate'] = param.Value;
                        break;
                    case PatientCertificateFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientCertificateFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    // case PatientCertificateFilters.AdmissionStatusId:
                    //     where['AdmissionStatusId'] = param.Value;
                    //     break;
                    case PatientCertificateFilters.AdmissionStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientCertificateFilters.VisitIdentifier:
                        (where as any)['$or'] = [{ 'VisitIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientCertificateFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientCertificateFilters.PatInfo:
                        (where as any)['$or'] = [{ 'PatientName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'PatientMrn': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'VisitIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientCertificateFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientCertificateFilters.FromDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientCertificateFilters.ToDOD:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientCertificateFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'BloodGroupId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('BloodGroup')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientCertificate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientCertificateFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetPatientCertificates(apiReq);
        return { [key]: val.Data };
    }
    public async PrintPatientCertificate(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientCertificateFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientCertificates(apiReq);
        let ismlc: boolean = false;
        let PatientCertificate = data.Data[0];
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: PatientCertificate.DoctorId }]
        };
        let UserBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let User = await UserBo.GetUsers(userReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientCertificate.PatientId });
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
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientCertificate.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);

        if (patientData.IsMLC) {
            ismlc = patientData.IsMLC;
        }
        if (encounterData.Data[0].IsMLC) {
            ismlc = patientData.IsMLC;
        }
        let prescriptionsBo = BoFactory.GetBo(PrescriptionBo.PrescriptionBo, this.Request);
        let prescription: any = [];
        let prescriptionids: any = [];
        let prescriptiondetails: any = [];
        let patienttracker: any = [];
        let prescriptionReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PrescriptionFilters.EncounterId, Value: req.Id },
            { Key: PrescriptionFilters.IsDischargeMedication, Value: true }]
        };
        let prescriptiondata = await prescriptionsBo.GetPrescriptions(prescriptionReq);
        prescription = prescriptiondata.Data[0];
        if (prescription) {
            for (var idx in prescriptiondata.Data) {
                prescriptionids.push(prescriptiondata.Data[idx].Id);
            }
            let presDetailBo = BoFactory.GetBo(PrescriptionDetailBo.PrescriptionDetailBo);
            let apiPresDetReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: [prescriptionids] }]
            };
            let PrescriptionDetaildata1 = await presDetailBo.GetPrescriptionDetails(apiPresDetReq);
            if (PrescriptionDetaildata1 && PrescriptionDetaildata1.Data)
                prescriptiondetails = PrescriptionDetaildata1.Data;
            let patienttrackerReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientTrackerFilters.EncounterId, Value: req.Id },
                { Key: PatientTrackerFilters.IsDischargeMedication, Value: true }]
            };
            let PatienttrackerBo = BoFactory.GetBo(PatientTrackerBo.PatientTrackerBo);
            let patienttrackerdata = await PatienttrackerBo.GetPatientTrackers(patienttrackerReq);
            patienttracker = patienttrackerdata.Data;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let facilityReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: FacilityPreferenceFilters.FacilityId, Value: patientData.FacilityId },
            { Key: FacilityPreferenceFilters.Category, Value: 'billing' },
            { Key: FacilityPreferenceFilters.PreferenceKey, Value: 'isdischargedoctordisplay' }]

        };
        let facilityBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let facilityData =
            await facilityBO.GetFacilityPreferences(facilityReq);
        let OtRegisterReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.EncounterId, Value: PatientCertificate.EncounterId },
            { Key: SurgeryEntryFilters.PatientId, Value: PatientCertificate.PatientId }]
        };
        let surgeryentryBO = BoFactory.GetBo(OtManagementBo.SurgeryEntryBo, this.Request);
        let OtRegister = await surgeryentryBO.GetSurgeryEntrys(OtRegisterReq);
        let OtRegisterData = OtRegister.Data[0];
        let HeaderTitle = '';
        if (PatientCertificate.DischargeTypeId === 2) {
            HeaderTitle = 'DEATH SUMMARY';
        } else if (PatientCertificate.DischargeTypeId === 3) {
            HeaderTitle = 'LEGAL AGAINST MEDICAL ADVICE (LAMA)';
        } else if (PatientCertificate.DischargeTypeId === 4) {
            HeaderTitle = 'DISCHARGE AGAINST MEDICAL ADVICE (DAMA)';
        } else if (PatientCertificate.DischargeTypeId === 7) {
            HeaderTitle = 'DISCHARGE AT REQUEST';
        } else {
            HeaderTitle = 'DISCHARGE SUMMARY';
        }
        let info = {
            Title: '',
            Patient: patientData,
            PatientCertificate: PatientCertificate,
            User: User.Data[0],
            Age: Age,
            Encounter: encounterData.Data[0],
            prescription: prescription,
            prescriptiondetail: prescriptiondetails,
            patienttracker: patienttracker,
            Preferences: printPreferencesData,
            facility: facilityData.Data[0],
            HeaderTitle: HeaderTitle,
            OtRegisterData: OtRegisterData,
            IsMlc: ismlc
        };
        if (PatientCertificate.NoteTypeId === 1) {
            info.Title = 'DISCHARGE SUMMARY';
        } if (PatientCertificate.NoteTypeId === 2) {
            info.Title = 'Medical Certificate';
        }
        if (PatientCertificate.NoteTypeId === 3) {
            info.Title = 'Birth Certificate';
        }
        if (PatientCertificate.NoteTypeId === 4) {
            info.Title = 'Death Certificate';
        }
        let reportKey = 'dischargesummary';
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
    public async PrintPatientCertificatewithoutheader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientCertificateFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientCertificates(apiReq);
        let ismlc: boolean = false;
        let PatientCertificate = data.Data[0];
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: PatientCertificate.DoctorId }]
        };
        let UserBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let User = await UserBo.GetUsers(userReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientCertificate.PatientId });
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
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientCertificate.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        if (patientData.IsMLC) {
            ismlc = patientData.IsMLC;
        }
        if (encounterData.Data[0].IsMLC) {
            ismlc = patientData.IsMLC;
        }
        let prescriptionsBo = BoFactory.GetBo(PrescriptionBo.PrescriptionBo, this.Request);
        let prescription: any = [];
        let prescriptionids: any = [];
        let prescriptiondetails: any = [];
        let patienttracker: any = [];
        let prescriptionReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PrescriptionFilters.EncounterId, Value: req.Id },
            { Key: PrescriptionFilters.IsDischargeMedication, Value: true }]
        };
        let prescriptiondata = await prescriptionsBo.GetPrescriptions(prescriptionReq);
        prescription = prescriptiondata.Data[0];
        if (prescription) {
            for (var idx in prescriptiondata.Data) {
                prescriptionids.push(prescriptiondata.Data[idx].Id);
            }
            let presDetailBo = BoFactory.GetBo(PrescriptionDetailBo.PrescriptionDetailBo);
            let apiPresDetReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: [prescriptionids] }]
            };
            let PrescriptionDetaildata1 = await presDetailBo.GetPrescriptionDetails(apiPresDetReq);
            if (PrescriptionDetaildata1 && PrescriptionDetaildata1.Data)
                prescriptiondetails = PrescriptionDetaildata1.Data;
            let patienttrackerReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientTrackerFilters.EncounterId, Value: req.Id },
                { Key: PatientTrackerFilters.IsDischargeMedication, Value: true }]
            };
            let PatienttrackerBo = BoFactory.GetBo(PatientTrackerBo.PatientTrackerBo);
            let patienttrackerdata = await PatienttrackerBo.GetPatientTrackers(patienttrackerReq);
            patienttracker = patienttrackerdata.Data;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let facilityReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: FacilityPreferenceFilters.FacilityId, Value: patientData.FacilityId },
            { Key: FacilityPreferenceFilters.Category, Value: 'billing' },
            { Key: FacilityPreferenceFilters.PreferenceKey, Value: 'isdischargedoctordisplay' }]
        };
        let facilityBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let facilityData =
            await facilityBO.GetFacilityPreferences(facilityReq);
        let OtRegisterReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.EncounterId, Value: PatientCertificate.EncounterId },
            { Key: SurgeryEntryFilters.PatientId, Value: PatientCertificate.PatientId }]
        };
        let surgeryentryBO = BoFactory.GetBo(OtManagementBo.SurgeryEntryBo, this.Request);
        let OtRegister = await surgeryentryBO.GetSurgeryEntrys(OtRegisterReq);
        let OtRegisterData = OtRegister.Data[0];
        let HeaderTitle = '';
        if (PatientCertificate.DischargeTypeId === 2) {
            HeaderTitle = 'DEATH SUMMARY';
        } else if (PatientCertificate.DischargeTypeId === 3) {
            HeaderTitle = 'LEGAL AGAINST MEDICAL ADVICE';
        } else if (PatientCertificate.DischargeTypeId === 4) {
            HeaderTitle = 'DISCHARGE AGAINST MEDICAL ADVICE';
        } else {
            HeaderTitle = 'DISCHARGE SUMMARY';
        }
        let info = {
            Title: '',
            Patient: patientData,
            PatientCertificate: PatientCertificate,
            User: User.Data[0],
            Age: Age,
            Encounter: encounterData.Data[0],
            prescription: prescription,
            prescriptiondetail: prescriptiondetails,
            patienttracker: patienttracker,
            Preferences: printPreferencesData,
            facility: facilityData.Data[0],
            HeaderTitle: HeaderTitle,
            OtRegisterData: OtRegisterData,
            IsMlc: ismlc
        };
        //let pdfOption: any = null;
        let reportKey = 'dischargesummarywithoutheader';
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
                height: '0.5in',
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
        // return await Report.Generate('dischargesummarywithoutheader', { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<PatientCertificateInstance, PatientCertificateAttributes> {
        return this.Models.PatientCertificate;
    }
}
