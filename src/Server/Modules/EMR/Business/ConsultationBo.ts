import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ConsultationInstance, ConsultationAttributes } from '../Model/Interface/Index';
import { ConsultationFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as emr from '../../EMR/Business/Index';
import * as appbo from '../../Appointment/Business/Index';
import * as otmangebo from '../../OtManagement/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as _ from 'lodash';
import * as moment from 'moment';
import { join } from 'path';
import {
    PatientAllergyFilters, PatientConditionFilters,
    PatientVitalFilters, PatientProcedureFilters, ClinicalDocumentFilters,
    FamilyConditionFilters, PatientSocialHistoryFilters, FamilySocialHistoryFilters,
    PatientImmunizationFilters, PrescriptionFilters, PatientOrderFilters,
    PatientChiefComplaintFilters, PatientDischargeMedicationFilters,
    PatientAdviceMedicationFilters, DailyNoteFilters, TreatmentPlanFilters
} from '../../EMR/Common/Filters.e';
import {
    EncounterFilters
} from '../../Visit/Common/Filters.e';
import { SurgeryEntryFilters } from '../../OtManagement/Common/Filters.e';
import { PatientTrackerFilters } from '../../Appointment/Common/Filters.e';

export class ConsultationBo extends BaseBo<ConsultationInstance, ConsultationAttributes>  {
    public async AddConsultation(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        await this.UpdateEncounterInfo(req);
        return result.dataValues.Id;
    }

    public async UpdateEncounterInfo(req: BaseRequest): Promise<boolean> {
        if (req && req.Data && req.Data.EncounterId) {
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            ////let Encounter = await encounterBo.GetEncounterById({ Id: req.Data.EncounterId });
            let encreq: any = {
                Data: {
                    Id: req.Data.EncounterId,
                    EncounterId: req.Data.EncounterId,
                }
            };
            if (req.Data.DischargeDate) {
                encreq.Data.DischargeDate = req.Data.DischargeDate;
            }
            if (req.Data.SurgeryDate) {
                encreq.Data.SurgeryDate = req.Data.SurgeryDate;
            }
            if (req.Data.DischargeTypeId) {
                encreq.Data.DischargeTypeId = req.Data.DischargeTypeId;
            }
            await encounterBo.UpdateEncounter(encreq);
        }

        return true;
    }

    public async UpdateConsultation(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        await this.UpdateEncounterInfo(req);
        return result;
    }

    public async UpdateProgressNoteStatus(req: BaseRequest): Promise<boolean> {
        let generateRefNo = 0;
        if (req.Data.ProgressNoteStatusId === 2) {
            req.Data.ReferenceNo = null;
            generateRefNo = 1;
            // await Sequence.Next(SequenceKeys.ConsultationId);
        }
        let consultationInstance = await this.GetById(req.Id);
        let result = false;
        if (consultationInstance) {
            let consultation = this.GetAttribute(consultationInstance);
            consultation.ProgressNoteStatusId = req.Data.ProgressNoteStatusId;
            consultation.ReferenceNo = req.Data.ReferenceNo;
            consultation.ApprovedBy = req.Data.ApprovedBy;
            result = await this.Update(consultation);
            if (generateRefNo === 1) {
                this.deferSequenceKey(consultation.Id, 'ReferenceNo',
                    this.getSequenceIdentifier(SequenceKeys.ConsultationId));
            }
        }
        return result;
    }

    public async GetConsultationById(req: BaseRequest): Promise<ConsultationAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Encounter, required: false,
            include: [
                { model: this.Models.Remark, attributes: ['Remarks'], as: 'VisitReason', required: false },
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'LicenseNo',
                        'SignPath', 'Qualification'], required: false,
                },
                { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                {
                    model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId', 'StoreMasterId'],
                    required: false
                },
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                    include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                    include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
                },
                this.GetReference('AdmittingReason'),
            ]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: false,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.ProfileMaster, required: false,
            include: [{
                model: this.Models.ProfileSection, required: false,
                include: [{ model: this.Models.SectionMaster, required: false }]
            }]
        });
        include.push({
            model: this.Models.User, as: 'Doc', attributes: ['FirstName', 'LastName', 'LicenseNo', 'Qualification'], required: false,
            include: [this.GetReference('Title'),
            { model: this.Models.Speciality, attributes: ['SpecialityName'], required: false }]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName',
                'LastName', 'LicenseNo', 'DepartmentId', 'Qualification'], required: false,
            include: [this.GetReference('Title'),
            { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false }]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath', 'SpecialityId',
                'DepartmentId', 'Qualification'], required: false,
            include: [this.GetReference('Title'),
            { model: this.Models.Speciality, attributes: ['SpecialityName'], required: false },
            { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false }]
        });
        include.push(this.GetReference('ProgressNoteStatus'));
        include.push(this.GetReference('VisitType'));
        include.push(this.GetReference('DischargeType'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetConsultations(apiReq?: ApiRequest<ConsultationFilters>): Promise<ApiResponse<ConsultationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let ProfileWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        let isReqPatientSearch: boolean = false;
        let isReqEncounterSearch, isReqProfileSearch: boolean = false;
        // include.push({ model: this.Models.ProfileMaster, required: false });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LicenseNo',
                'LastName', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName',
                'LicenseNo', 'SignPath', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doc', attributes: ['Id', 'FirstName', 'LicenseNo',
                'TitleId', 'Qualification'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('DischargeType'));
        include.push(this.GetReference('ProgressNoteStatus'));
        include.push({ model: this.Models.Department, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ConsultationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ConsultationFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ConsultationFilters.Encounter:
                        where['EncounterId'] = param.Value;
                        EncounterWhere['EncounterId'] = param.Value;
                        // EncounterWhere['IsLatest'] = true;
                        isReqEncounterSearch = true;
                        break;
                    case ConsultationFilters.Patient:
                        where['PatientId'] = param.Value;
                        break;
                    case ConsultationFilters.ProgressNoteStatus:
                        where['ProgressNoteStatusId'] = param.Value;
                        break;
                    case ConsultationFilters.EncounterDoctor:
                        where['EncounterDoctorId'] = param.Value;
                        break;
                    case ConsultationFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value || '' };
                        break;
                    case ConsultationFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case ConsultationFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case ConsultationFilters.EncounterTypeId:
                        EncounterWhere['EncounterTypeId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case ConsultationFilters.NoEncounterId:
                        (where as any)['$not'] = [{ 'EncounterId': param.Value }];
                        break;
                    case ConsultationFilters.NotCurrentId:
                        (where as any)['$not'] = [{ 'Id': param.Value }];
                        break;
                    case ConsultationFilters.ProfileId:
                        where['ProfileId'] = param.Value;
                        break;
                    case ConsultationFilters.ProfilemasterTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            ProfileWhere['ProfilemasterTypeId'] = { '$in': paramArr };
                        }
                        // ProfileWhere['ProfilemasterTypeId'] = param.Value;
                        isReqProfileSearch = true;
                        break;
                    case ConsultationFilters.IsIVF:
                        where['IsIVF'] = param.Value;
                        break;
                    case ConsultationFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        // } else {
                        //     patientWhere['$or'] = [{ 'FirstName': { '$like': '' + (param.Value || '') + '%' } },
                        //     { 'LastName': { '$like': '' + (param.Value || '') + '%' } },
                        //     { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        //     { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        // }
                        isReqPatientSearch = true;
                        break;
                    case ConsultationFilters.VisitIdentifier:
                        (EncounterWhere as any)['$or'] = [{ 'VisitIdentifier': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqEncounterSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter,
            required: isReqEncounterSearch,
            attributes: ['Id', 'EncounterTypeId', 'AdmissionStatusId',
                'VisitTypeId', 'RemarkId', 'VisitReasonId',
                'EncounterTypeId', 'PatientId', 'VisitIdentifier'],
            where: EncounterWhere,
            include: [{ model: this.Models.Remark, attributes: ['Remarks'], as: 'VisitReason', required: false },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            this.GetReference('EncounterType'), this.GetReference('AdmissionStatus'), this.GetReference('VisitType'),
            this.GetReference('AdmittingReason')]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['PatientId', 'firstname', 'TitleId', 'lastname', 'MRN'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.ProfileMaster,
            where: ProfileWhere, required: isReqProfileSearch
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteConsultation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintConsultation(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;
        let otregisterid = req.Data.otregisterid ? req.Data.otregisterid : 0;

        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                PatientAdviceMedications: {},
                TreatmentPlan: {},
                Followup: {},
                Questions: question
            },
            SectionList: sec
        };

        // let sections = currentConsultation.ProfileMaster.ProfileSections;
        // let OrderSections = _.orderBy(sections, ['DisplayOrder']);
        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let OrderSections = sections.slice().sort(function (var1: any, var2: any) {
            if (Number(var1.DisplayOrder) < Number(var2.DisplayOrder)) return -1;
            if (Number(var1.DisplayOrder) > Number(var2.DisplayOrder)) return 1;
            return 0;
        });
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }

        for (var idx in OrderSections) {
            let resultValue: any = {};
            var section = OrderSections[idx];
            if (printSections.PrintConfig && printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                continue; //Skip this section
            }
            if (req.Data && req.Data.sectionList.indexOf(section.SectionMaster.Id) === -1) {
                continue; //Skip this section
            }
            switch (section.SectionMaster.SRef) {
                case 'emr.cn.question':
                    if (otregisterid > 0) {
                        resultValue = await this.GetCategorySectionEntryForOtRegister(section.SectionId, consultationId, otregisterid);
                    } else {
                        resultValue = await this.GetCategorySectionEntry(section.SectionId, consultationId);
                    }
                    let maps: any = {};
                    for (var jdx in resultValue.map) {
                        let item: any = resultValue.map[jdx];
                        maps[item.CategoryId] = item.DisplayOrder;
                    }
                    let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                        section.SectionMaster.Name);
                    await this.FormatData(questionSecData);
                    info.SectionValues.Questions.push(questionSecData);
                    info.SectionList.push({ Questions: questionSecData });
                    break;
                case 'emr.cn.chiefcomplaint':
                    info.SectionValues.Chiefcomplaint = await this.GetChiefComplaints(patientId, consultationId);
                    info.SectionList.push({ Chiefcomplaint: info.SectionValues.Chiefcomplaint });
                    break;
                case 'emr.cn.allergy':
                    info.SectionValues.Allergy = await this.GetAllergies(patientId, consultationId);
                    // info.SectionList.push({ key: 'allergy' });
                    info.SectionList.push({ Allergy: info.SectionValues.Allergy });
                    break;
                case 'emr.cn.diagnosis':
                    info.SectionValues.Condition = await this.GetConditions(patientId, consultationId);
                    // info.SectionList.push({ key: 'condition' });
                    info.SectionList.push({ Condition: info.SectionValues.Condition });
                    break;
                case 'emr.cn.vital':
                    info.SectionValues.Vital = await this.GetVitals(patientId, consultationId);
                    await this.FormatVitalData(info.SectionValues.Vital);
                    // info.SectionList.push({ key: 'vital' });
                    info.SectionList.push({ Vital: info.SectionValues.Vital });
                    break;
                case 'emr.cn.procedure':
                    info.SectionValues.Procedure = await this.GetProcedures(patientId, consultationId);
                    info.SectionList.push({ Procedure: info.SectionValues.Procedure });
                    break;
                case 'emr.cn.document':
                    info.SectionValues.Documents = await this.GetDocuments(patientId, consultationId);
                    info.SectionList.push({ Documents: info.SectionValues.Documents });
                    break;
                case 'emr.cn.familycondition':
                    info.SectionValues.Familyconditions = await this.GetFamilyConditions(patientId, consultationId);
                    info.SectionList.push({ Familyconditions: info.SectionValues.Familyconditions });
                    break;
                case 'emr.cn.socialhistory':
                    info.SectionValues.Socialhistory = await this.GetSocialHistory(patientId, consultationId);
                    info.SectionList.push({ Socialhistory: info.SectionValues.Socialhistory });
                    break;
                case 'emr.cn.familysocialhistory':
                    info.SectionValues.Familysocialhistory = await this.GetFamilySocialHistory(patientId, consultationId);
                    info.SectionList.push({ Familysocialhistory: info.SectionValues.Familysocialhistory });
                    break;
                case 'emr.cn.immunization':
                    info.SectionValues.Immunization = await this.GetImmunizations(patientId, consultationId);
                    info.SectionList.push({ Immunization: info.SectionValues.Immunization });
                    break;
                case 'emr.cn.prescription':
                    info.SectionValues.Prescription = await this.GetPrescriptions(patientId, consultationId);
                    info.SectionList.push({ Prescription: info.SectionValues.Prescription });
                    break;
                case 'emr.cn.order':
                    info.SectionValues.Order = await this.GetOrders(patientId, consultationId);
                    info.SectionList.push({ Order: info.SectionValues.Order });
                    break;
                case 'emr.cn.labresults':
                    info.SectionValues.Labresult = await this.GetLabResults(patientId, consultationId);
                    info.SectionList.push({ Labresult: info.SectionValues.Labresult });
                    break;
                case 'emr.cn.radiologyresults':
                    info.SectionValues.Radiologyresult = await this.GetRadiologyResults(patientId, consultationId);
                    info.SectionList.push({ Radiologyresult: info.SectionValues.Radiologyresult });
                    break;
                case 'emr.cn.advicemedications':
                    info.SectionValues.PatientAdviceMedications = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications: info.SectionValues.PatientAdviceMedications });
                    break;
                case 'emr.cn.followup':
                    info.SectionValues.Followup = await this.GetConsPatientTrackers(patientId, consultationId);
                    info.SectionList.push({ Followup: info.SectionValues.Followup });
                    break;
                case 'emr.cn.treatmentplan':
                    info.SectionValues.TreatmentPlan = await this.GetConsTreatmentPlans(patientId, consultationId);
                    await this.TreatmentData(info.SectionValues.TreatmentPlan);
                    info.SectionList.push({ TreatmentPlan: info.SectionValues.TreatmentPlan });
                    break;
                default:
                    // Todo
                    break;
            }
        }
        let key = 'reviewnotes';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.5in',
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

    public async PrintIPCaseSheetSummary(req: BaseRequest): Promise<FileInfo> {


        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let EncounterId = req.Data.EncounterId ? req.Data.EncounterId : 0;


        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);
        let sec: Array<any> = [];
        let info = {
            Text: '',
            Title: '',
            Encounter: Encounter,
            Preferences: printPreferencesData,
            SectionValues: {
                Condition: {},
                Vital: {},
                DoctorNotes: {},
                NurseNotes: {},
            },
            SectionList: sec
        };

        let condReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientConditionFilters.PatientId, Value: patientId },
                { Key: PatientConditionFilters.EncounterId, Value: EncounterId }
            ]
        };
        let conditionBo = BoFactory.GetBo(emr.PatientConditionBo, this.Request);
        info.SectionValues.Condition = await conditionBo.GetPatientConditions(condReq);
        info.SectionList.push({ Condition: info.SectionValues.Condition });

        let vitalReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientVitalFilters.PatientId, Value: patientId },
                { Key: PatientVitalFilters.EncounterId, Value: EncounterId }
            ]
        };
        let vitalBo = BoFactory.GetBo(emr.PatientVitalBo, this.Request);
        info.SectionValues.Vital = await vitalBo.GetPatientVitals(vitalReq);
        await this.FormatVitalData(info.SectionValues.Vital);
        info.SectionList.push({ Vital: info.SectionValues.Vital });

        let doctorReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: DailyNoteFilters.PatientId, Value: patientId },
                { Key: DailyNoteFilters.EncounterId, Value: EncounterId },
                { Key: DailyNoteFilters.NoteTypeId, Value: 1 }
            ]
        };
        let docNotesBO = BoFactory.GetBo(emr.DailyNoteBo, this.Request);
        info.SectionValues.DoctorNotes = await docNotesBO.GetDailyNotes(doctorReq);


        let nurseReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: DailyNoteFilters.PatientId, Value: patientId },
                { Key: DailyNoteFilters.EncounterId, Value: EncounterId },
                { Key: DailyNoteFilters.NoteTypeId, Value: 2 }
            ]
        };
        let nurseNotesBO = BoFactory.GetBo(emr.DailyNoteBo, this.Request);
        info.SectionValues.NurseNotes = await nurseNotesBO.GetDailyNotes(nurseReq);

        let key = 'ipcasesheetsummary';

        return await Report.Generate(key, { header: {}, body: info });
    }
    public async PrintConsultationWithoutHeader(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;
        let otregisterid = req.Data.otregisterid ? req.Data.otregisterid : 0;

        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                PatientAdviceMedications: {},
                TreatmentPlan: {},
                Followup: {},
                Questions: question
            },
            SectionList: sec
        };

        // let sections = currentConsultation.ProfileMaster.ProfileSections;
        // let OrderSections = _.orderBy(sections, ['DisplayOrder']);
        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let OrderSections = sections.slice().sort(function (var1: any, var2: any) {
            if (Number(var1.DisplayOrder) < Number(var2.DisplayOrder)) return -1;
            if (Number(var1.DisplayOrder) > Number(var2.DisplayOrder)) return 1;
            return 0;
        });
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }

        for (var idx in OrderSections) {
            let resultValue: any = {};
            var section = OrderSections[idx];
            if (printSections.PrintConfig && printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                continue; //Skip this section
            }
            if (req.Data && req.Data.sectionList.indexOf(section.SectionMaster.Id) === -1) {
                continue; //Skip this section
            }
            switch (section.SectionMaster.SRef) {
                case 'emr.cn.question':
                    if (otregisterid > 0) {
                        resultValue = await this.GetCategorySectionEntryForOtRegister(section.SectionId, consultationId, otregisterid);
                    } else {
                        resultValue = await this.GetCategorySectionEntry(section.SectionId, consultationId);
                    }
                    let maps: any = {};
                    for (var jdx in resultValue.map) {
                        let item: any = resultValue.map[jdx];
                        maps[item.CategoryId] = item.DisplayOrder;
                    }
                    let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                        section.SectionMaster.Name);
                    await this.FormatData(questionSecData);
                    info.SectionValues.Questions.push(questionSecData);
                    info.SectionList.push({ Questions: questionSecData });
                    break;
                case 'emr.cn.chiefcomplaint':
                    info.SectionValues.Chiefcomplaint = await this.GetChiefComplaints(patientId, consultationId);
                    info.SectionList.push({ Chiefcomplaint: info.SectionValues.Chiefcomplaint });
                    break;
                case 'emr.cn.allergy':
                    info.SectionValues.Allergy = await this.GetAllergies(patientId, consultationId);
                    // info.SectionList.push({ key: 'allergy' });
                    info.SectionList.push({ Allergy: info.SectionValues.Allergy });
                    break;
                case 'emr.cn.diagnosis':
                    info.SectionValues.Condition = await this.GetConditions(patientId, consultationId);
                    // info.SectionList.push({ key: 'condition' });
                    info.SectionList.push({ Condition: info.SectionValues.Condition });
                    break;
                case 'emr.cn.vital':
                    info.SectionValues.Vital = await this.GetVitals(patientId, consultationId);
                    await this.FormatVitalData(info.SectionValues.Vital);
                    // info.SectionList.push({ key: 'vital' });
                    info.SectionList.push({ Vital: info.SectionValues.Vital });
                    break;
                case 'emr.cn.procedure':
                    info.SectionValues.Procedure = await this.GetProcedures(patientId, consultationId);
                    info.SectionList.push({ Procedure: info.SectionValues.Procedure });
                    break;
                case 'emr.cn.document':
                    info.SectionValues.Documents = await this.GetDocuments(patientId, consultationId);
                    info.SectionList.push({ Documents: info.SectionValues.Documents });
                    break;
                case 'emr.cn.familycondition':
                    info.SectionValues.Familyconditions = await this.GetFamilyConditions(patientId, consultationId);
                    info.SectionList.push({ Familyconditions: info.SectionValues.Familyconditions });
                    break;
                case 'emr.cn.socialhistory':
                    info.SectionValues.Socialhistory = await this.GetSocialHistory(patientId, consultationId);
                    info.SectionList.push({ Socialhistory: info.SectionValues.Socialhistory });
                    break;
                case 'emr.cn.familysocialhistory':
                    info.SectionValues.Familysocialhistory = await this.GetFamilySocialHistory(patientId, consultationId);
                    info.SectionList.push({ Familysocialhistory: info.SectionValues.Familysocialhistory });
                    break;
                case 'emr.cn.immunization':
                    info.SectionValues.Immunization = await this.GetImmunizations(patientId, consultationId);
                    info.SectionList.push({ Immunization: info.SectionValues.Immunization });
                    break;
                case 'emr.cn.prescription':
                    info.SectionValues.Prescription = await this.GetPrescriptions(patientId, consultationId);
                    info.SectionList.push({ Prescription: info.SectionValues.Prescription });
                    break;
                case 'emr.cn.order':
                    info.SectionValues.Order = await this.GetOrders(patientId, consultationId);
                    info.SectionList.push({ Order: info.SectionValues.Order });
                    break;
                case 'emr.cn.labresults':
                    info.SectionValues.Labresult = await this.GetLabResults(patientId, consultationId);
                    info.SectionList.push({ Labresult: info.SectionValues.Labresult });
                    break;
                case 'emr.cn.radiologyresults':
                    info.SectionValues.Radiologyresult = await this.GetRadiologyResults(patientId, consultationId);
                    info.SectionList.push({ Radiologyresult: info.SectionValues.Radiologyresult });
                    break;
                case 'emr.cn.advicemedications':
                    info.SectionValues.PatientAdviceMedications = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications: info.SectionValues.PatientAdviceMedications });
                    break;
                case 'emr.cn.followup':
                    info.SectionValues.Followup = await this.GetConsPatientTrackers(patientId, consultationId);
                    info.SectionList.push({ Followup: info.SectionValues.Followup });
                    break;
                case 'emr.cn.treatmentplan':
                    info.SectionValues.TreatmentPlan = await this.GetConsTreatmentPlans(patientId, consultationId);
                    await this.TreatmentData(info.SectionValues.TreatmentPlan);
                    info.SectionList.push({ TreatmentPlan: info.SectionValues.TreatmentPlan });
                    break;
                default:
                    // Todo
                    break;
            }
        }

        let key = 'reviewnoteswithoutheader';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.5in',
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

    public async PrintDischargeLabResult(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: req.Data.ConsultationId,
            Data: {}
        };
        let CurrentConsultation: any = await this.GetConsultationById(apiReq);

        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;
        let ConsolidateLabresult = await this.GetDischargeLabResults(patientId, consultationId);

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let info = {
            CurrentConsultation: CurrentConsultation,
            ConsolidateLabresult: ConsolidateLabresult,
            Preferences: printPreferencesData
        };
        let key = 'dischargelabresult';

        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.5in',
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

    public async PrintDischargeCasesheet(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;

        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let HeaderTitle = '';
        if (currentConsultation.DischargeTypeId === 2) {
            HeaderTitle = 'DEATH SUMMARY';
        } else if (currentConsultation.DischargeTypeId === 3) {
            HeaderTitle = 'LEGAL AGAINST MEDICAL ADVICE (LAMA)';
        } else if (currentConsultation.DischargeTypeId === 4) {
            HeaderTitle = 'DISCHARGE AGAINST MEDICAL ADVICE (DAMA)';
        } else {
            HeaderTitle = 'DISCHARGE SUMMARY';
        }

        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            HeaderTitle: HeaderTitle,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                PatientAdviceMedications: {},
                PatientAdviceMedications1: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                Medications: {},
                OtNotes: {},
                Questions: question
            },
            SectionList: sec
        };

        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let OrderSections = sections.slice().sort(function (var1: any, var2: any) {
            if (Number(var1.DisplayOrder) < Number(var2.DisplayOrder)) return -1;
            if (Number(var1.DisplayOrder) > Number(var2.DisplayOrder)) return 1;
            return 0;
        });
        //let OrderSections = _.orderBy(sections, ['DisplayOrder'], ['asc']);
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }

        for (var idx in OrderSections) {
            let resultValue: any = {};
            var section = OrderSections[idx];
            if (printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                // continue; //Skip this section
            }
            switch (section.SectionMaster.SRef) {
                case 'emr.cn.question':
                    resultValue = await this.GetCategorySectionEntry(section.SectionId, consultationId);
                    let maps: any = {};
                    for (var jdx in resultValue.map) {
                        let item: any = resultValue.map[jdx];
                        maps[item.CategoryId] = item.DisplayOrder;
                    }
                    let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                        section.SectionMaster.Name);
                    await this.FormatData(questionSecData);
                    info.SectionValues.Questions.push(questionSecData);
                    info.SectionList.push({ Questions: questionSecData });
                    break;
                case 'emr.cn.allergy':
                    info.SectionValues.Allergy = await this.GetAllergies(patientId, consultationId);
                    // info.SectionList.push({ key: 'allergy' });
                    info.SectionList.push({ Allergy: info.SectionValues.Allergy });
                    break;
                case 'emr.cn.diagnosis':
                    info.SectionValues.Condition = await this.GetConditions(patientId, consultationId);
                    // info.SectionList.push({ key: 'condition' });
                    info.SectionList.push({ Condition: info.SectionValues.Condition });
                    break;
                case 'emr.cn.vital':
                    info.SectionValues.Vital = await this.GetVitals(patientId, consultationId);
                    await this.FormatVitalData(info.SectionValues.Vital);
                    // info.SectionList.push({ key: 'vital' });
                    info.SectionList.push({ Vital: info.SectionValues.Vital });
                    break;
                case 'emr.cn.procedure':
                    info.SectionValues.Procedure = await this.GetProcedures(patientId, consultationId);
                    info.SectionList.push({ Procedure: info.SectionValues.Procedure });
                    break;
                case 'emr.cn.document':
                    info.SectionValues.Documents = await this.GetDocuments(patientId, consultationId);
                    info.SectionList.push({ Documents: info.SectionValues.Documents });
                    break;
                case 'emr.cn.familycondition':
                    info.SectionValues.Familyconditions = await this.GetFamilyConditions(patientId, consultationId);
                    info.SectionList.push({ Familyconditions: info.SectionValues.Familyconditions });
                    break;
                case 'emr.cn.socialhistory':
                    info.SectionValues.Socialhistory = await this.GetSocialHistory(patientId, consultationId);
                    info.SectionList.push({ Socialhistory: info.SectionValues.Socialhistory });
                    break;
                case 'emr.cn.familysocialhistory':
                    info.SectionValues.Familysocialhistory = await this.GetFamilySocialHistory(patientId, consultationId);
                    info.SectionList.push({ Familysocialhistory: info.SectionValues.Familysocialhistory });
                    break;
                case 'emr.cn.immunization':
                    info.SectionValues.Immunization = await this.GetImmunizations(patientId, consultationId);
                    info.SectionList.push({ Immunization: info.SectionValues.Immunization });
                    break;
                case 'emr.cn.prescription':
                    info.SectionValues.Prescription = await this.GetPrescriptions(patientId, consultationId);
                    info.SectionList.push({ Prescription: info.SectionValues.Prescription });
                    break;
                case 'emr.cn.advicemedications':
                    info.SectionValues.PatientAdviceMedications = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications: info.SectionValues.PatientAdviceMedications });
                    break;
                case 'emr.cn.dischargeadvice':
                    info.SectionValues.PatientAdviceMedications1 = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications1: info.SectionValues.PatientAdviceMedications1 });
                    break;
                case 'emr.cn.order':
                    info.SectionValues.Order = await this.GetOrders(patientId, consultationId);
                    info.SectionList.push({ Order: info.SectionValues.Order });
                    break;
                case 'emr.cn.chiefcomplaint':
                    info.SectionValues.Chiefcomplaint = await this.GetChiefComplaints(patientId, consultationId);
                    info.SectionList.push({ Chiefcomplaint: info.SectionValues.Chiefcomplaint });
                    break;
                case 'emr.cn.labresults':
                    info.SectionValues.Labresult =
                        await this.GetDischargeLabResults(patientId, consultationId);
                    info.SectionList.push({ Labresult: info.SectionValues.Labresult });
                    break;
                case 'emr.cn.radiologyresults':
                    info.SectionValues.Radiologyresult =
                        await this.GetDischargeRadiologyResults(patientId, consultationId);
                    info.SectionList.push({ Radiologyresult: info.SectionValues.Radiologyresult });
                    break;
                case 'emr.cn.followup':
                    // Todo
                    break;
                case 'emr.cn.medications':
                    info.SectionValues.Medications = await this.GetMedications(patientId, consultationId);
                    info.SectionList.push({ Medications: info.SectionValues.Medications });
                    break;
                case 'emr.cn.otnotes':
                    info.SectionValues.OtNotes = await this.GetOtNotes(patientId, consultationId);
                    info.SectionList.push({ OtNotes: info.SectionValues.OtNotes });
                    break;
                default:
                    // Todo
                    break;
            }
        }
        console.log('Print Array');
        for (var kdx in info.SectionList) {
            console.log(info.SectionList[kdx]);
        }
        // console.log(info.SectionList);
        let key = 'reviewnotesdischargecasesheet';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.5in',
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


    public async PrintDischargeCasesheetWithoutHeaderOld(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;

        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let HeaderTitle = '';
        if (currentConsultation.DischargeTypeId === 2) {
            HeaderTitle = 'DEATH SUMMARY';
        } else if (currentConsultation.DischargeTypeId === 3) {
            HeaderTitle = 'LEGAL AGAINST MEDICAL ADVICE (LAMA)';
        } else if (currentConsultation.DischargeTypeId === 4) {
            HeaderTitle = 'DISCHARGE AGAINST MEDICAL ADVICE (DAMA)';
        } else {
            HeaderTitle = 'DISCHARGE SUMMARY';
        }

        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            HeaderTitle: HeaderTitle,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                PatientAdviceMedications: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                Medications: {},
                OtNotes: {},
                Questions: question
            },
            SectionList: sec
        };

        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let OrderSections = sections.slice().sort(function (var1: any, var2: any) {
            if (Number(var1.DisplayOrder) < Number(var2.DisplayOrder)) return -1;
            if (Number(var1.DisplayOrder) > Number(var2.DisplayOrder)) return 1;
            return 0;
        });
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }

        for (var idx in OrderSections) {
            let resultValue: any = {};
            var section = OrderSections[idx];
            if (printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                // continue; //Skip this section
            }
            switch (section.SectionMaster.SRef) {
                case 'emr.cn.question':
                    resultValue = await this.GetCategorySectionEntry(section.SectionId, consultationId);
                    let maps: any = {};
                    for (var jdx in resultValue.map) {
                        let item: any = resultValue.map[jdx];
                        maps[item.CategoryId] = item.DisplayOrder;
                    }
                    let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                        section.SectionMaster.Name);
                    await this.FormatData(questionSecData);
                    info.SectionValues.Questions.push(questionSecData);
                    info.SectionList.push({ Questions: questionSecData });
                    break;
                case 'emr.cn.allergy':
                    info.SectionValues.Allergy = await this.GetAllergies(patientId, consultationId);
                    // info.SectionList.push({ key: 'allergy' });
                    info.SectionList.push({ Allergy: info.SectionValues.Allergy });
                    break;
                case 'emr.cn.diagnosis':
                    info.SectionValues.Condition = await this.GetConditions(patientId, consultationId);
                    // info.SectionList.push({ key: 'condition' });
                    info.SectionList.push({ Condition: info.SectionValues.Condition });
                    break;
                case 'emr.cn.vital':
                    info.SectionValues.Vital = await this.GetVitals(patientId, consultationId);
                    await this.FormatVitalData(info.SectionValues.Vital);
                    // info.SectionList.push({ key: 'vital' });
                    info.SectionList.push({ Vital: info.SectionValues.Vital });
                    break;
                case 'emr.cn.procedure':
                    info.SectionValues.Procedure = await this.GetProcedures(patientId, consultationId);
                    info.SectionList.push({ Procedure: info.SectionValues.Procedure });
                    break;
                case 'emr.cn.document':
                    info.SectionValues.Documents = await this.GetDocuments(patientId, consultationId);
                    info.SectionList.push({ Documents: info.SectionValues.Documents });
                    break;
                case 'emr.cn.familycondition':
                    info.SectionValues.Familyconditions = await this.GetFamilyConditions(patientId, consultationId);
                    info.SectionList.push({ Familyconditions: info.SectionValues.Familyconditions });
                    break;
                case 'emr.cn.socialhistory':
                    info.SectionValues.Socialhistory = await this.GetSocialHistory(patientId, consultationId);
                    info.SectionList.push({ Socialhistory: info.SectionValues.Socialhistory });
                    break;
                case 'emr.cn.familysocialhistory':
                    info.SectionValues.Familysocialhistory = await this.GetFamilySocialHistory(patientId, consultationId);
                    info.SectionList.push({ Familysocialhistory: info.SectionValues.Familysocialhistory });
                    break;
                case 'emr.cn.immunization':
                    info.SectionValues.Immunization = await this.GetImmunizations(patientId, consultationId);
                    info.SectionList.push({ Immunization: info.SectionValues.Immunization });
                    break;
                case 'emr.cn.prescription':
                    info.SectionValues.Prescription = await this.GetPrescriptions(patientId, consultationId);
                    info.SectionList.push({ Prescription: info.SectionValues.Prescription });
                    break;
                case 'emr.cn.advicemedications':
                    info.SectionValues.PatientAdviceMedications = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications: info.SectionValues.PatientAdviceMedications });
                    break;
                case 'emr.cn.order':
                    info.SectionValues.Order = await this.GetOrders(patientId, consultationId);
                    info.SectionList.push({ Order: info.SectionValues.Order });
                    break;
                case 'emr.cn.chiefcomplaint':
                    info.SectionValues.Chiefcomplaint = await this.GetChiefComplaints(patientId, consultationId);
                    info.SectionList.push({ Chiefcomplaint: info.SectionValues.Chiefcomplaint });
                    break;
                case 'emr.cn.labresults':
                    info.SectionValues.Labresult =
                        await this.GetDischargeLabResults(patientId, consultationId);
                    info.SectionList.push({ Labresult: info.SectionValues.Labresult });
                    break;
                case 'emr.cn.radiologyresults':
                    info.SectionValues.Radiologyresult =
                        await this.GetDischargeRadiologyResults(patientId, consultationId);
                    info.SectionList.push({ Radiologyresult: info.SectionValues.Radiologyresult });
                    break;
                case 'emr.cn.followup':
                    // Todo
                    break;
                case 'emr.cn.medications':
                    info.SectionValues.Medications = await this.GetMedications(patientId, consultationId);
                    info.SectionList.push({ Medications: info.SectionValues.Medications });
                    break;
                case 'emr.cn.otnotes':
                    info.SectionValues.OtNotes = await this.GetOtNotes(patientId, consultationId);
                    info.SectionList.push({ OtNotes: info.SectionValues.OtNotes });
                    break;
                default:
                    // Todo
                    break;
            }
        }
        let key = 'reviewnotesdischargecasesheetwoh';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.5in',
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

    public async PrintDischargeCasesheetWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let patientId = req.Data.PatientId ? req.Data.PatientId : 0;
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;

        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);
        let HeaderTitle = '';
        if (currentConsultation.DischargeTypeId === 2) {
            HeaderTitle = 'DEATH SUMMARY';
        } else if (currentConsultation.DischargeTypeId === 3) {
            HeaderTitle = 'LEGAL AGAINST MEDICAL ADVICE (LAMA)';
        } else if (currentConsultation.DischargeTypeId === 4) {
            HeaderTitle = 'DISCHARGE AGAINST MEDICAL ADVICE (DAMA)';
        } else {
            HeaderTitle = 'DISCHARGE SUMMARY';
        }
        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            HeaderTitle: HeaderTitle,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                PatientAdviceMedications: {},
                PatientAdviceMedications1: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                Medications: {},
                OtNotes: {},
                Questions: question
            },
            SectionList: sec
        };

        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let OrderSections = sections.slice().sort(function (var1: any, var2: any) {
            if (Number(var1.DisplayOrder) < Number(var2.DisplayOrder)) return -1;
            if (Number(var1.DisplayOrder) > Number(var2.DisplayOrder)) return 1;
            return 0;
        });
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }
        for (var idx in OrderSections) {
            let resultValue: any = {};
            var section = OrderSections[idx];
            if (printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                // continue; //Skip this section
            }
            switch (section.SectionMaster.SRef) {
                case 'emr.cn.question':
                    resultValue = await this.GetCategorySectionEntry(section.SectionId, consultationId);
                    let maps: any = {};
                    for (var jdx in resultValue.map) {
                        let item: any = resultValue.map[jdx];
                        maps[item.CategoryId] = item.DisplayOrder;
                    }
                    let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                        section.SectionMaster.Name);
                    await this.FormatData(questionSecData);
                    info.SectionValues.Questions.push(questionSecData);
                    info.SectionList.push({ Questions: questionSecData });
                    break;
                case 'emr.cn.allergy':
                    info.SectionValues.Allergy = await this.GetAllergies(patientId, consultationId);
                    // info.SectionList.push({ key: 'allergy' });
                    info.SectionList.push({ Allergy: info.SectionValues.Allergy });
                    break;
                case 'emr.cn.diagnosis':
                    info.SectionValues.Condition = await this.GetConditions(patientId, consultationId);
                    // info.SectionList.push({ key: 'condition' });
                    info.SectionList.push({ Condition: info.SectionValues.Condition });
                    break;
                case 'emr.cn.vital':
                    info.SectionValues.Vital = await this.GetVitals(patientId, consultationId);
                    await this.FormatVitalData(info.SectionValues.Vital);
                    // info.SectionList.push({ key: 'vital' });
                    info.SectionList.push({ Vital: info.SectionValues.Vital });
                    break;
                case 'emr.cn.procedure':
                    info.SectionValues.Procedure = await this.GetProcedures(patientId, consultationId);
                    info.SectionList.push({ Procedure: info.SectionValues.Procedure });
                    break;
                case 'emr.cn.document':
                    info.SectionValues.Documents = await this.GetDocuments(patientId, consultationId);
                    info.SectionList.push({ Documents: info.SectionValues.Documents });
                    break;
                case 'emr.cn.familycondition':
                    info.SectionValues.Familyconditions = await this.GetFamilyConditions(patientId, consultationId);
                    info.SectionList.push({ Familyconditions: info.SectionValues.Familyconditions });
                    break;
                case 'emr.cn.socialhistory':
                    info.SectionValues.Socialhistory = await this.GetSocialHistory(patientId, consultationId);
                    info.SectionList.push({ Socialhistory: info.SectionValues.Socialhistory });
                    break;
                case 'emr.cn.familysocialhistory':
                    info.SectionValues.Familysocialhistory = await this.GetFamilySocialHistory(patientId, consultationId);
                    info.SectionList.push({ Familysocialhistory: info.SectionValues.Familysocialhistory });
                    break;
                case 'emr.cn.immunization':
                    info.SectionValues.Immunization = await this.GetImmunizations(patientId, consultationId);
                    info.SectionList.push({ Immunization: info.SectionValues.Immunization });
                    break;
                case 'emr.cn.prescription':
                    info.SectionValues.Prescription = await this.GetPrescriptions(patientId, consultationId);
                    info.SectionList.push({ Prescription: info.SectionValues.Prescription });
                    break;
                case 'emr.cn.advicemedications':
                    info.SectionValues.PatientAdviceMedications = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications: info.SectionValues.PatientAdviceMedications });
                    break;
                case 'emr.cn.dischargeadvice':
                    info.SectionValues.PatientAdviceMedications1 = await this.GetPatientAdviceMedications(patientId, consultationId);
                    info.SectionList.push({ PatientAdviceMedications1: info.SectionValues.PatientAdviceMedications1 });
                    break;
                case 'emr.cn.order':
                    info.SectionValues.Order = await this.GetOrders(patientId, consultationId);
                    info.SectionList.push({ Order: info.SectionValues.Order });
                    break;
                case 'emr.cn.chiefcomplaint':
                    info.SectionValues.Chiefcomplaint = await this.GetChiefComplaints(patientId, consultationId);
                    info.SectionList.push({ Chiefcomplaint: info.SectionValues.Chiefcomplaint });
                    break;
                case 'emr.cn.labresults':
                    info.SectionValues.Labresult =
                        await this.GetDischargeLabResults(patientId, consultationId);
                    info.SectionList.push({ Labresult: info.SectionValues.Labresult });
                    break;
                case 'emr.cn.radiologyresults':
                    info.SectionValues.Radiologyresult =
                        await this.GetDischargeRadiologyResults(patientId, consultationId);
                    info.SectionList.push({ Radiologyresult: info.SectionValues.Radiologyresult });
                    break;
                case 'emr.cn.followup':
                    // Todo
                    break;
                case 'emr.cn.medications':
                    info.SectionValues.Medications = await this.GetMedications(patientId, consultationId);
                    info.SectionList.push({ Medications: info.SectionValues.Medications });
                    break;
                case 'emr.cn.otnotes':
                    info.SectionValues.OtNotes = await this.GetOtNotes(patientId, consultationId);
                    info.SectionList.push({ OtNotes: info.SectionValues.OtNotes });
                    break;
                default:
                    // Todo
                    break;
            }
        }
        let key = 'reviewnotesdischargecasesheetwoh';
        let Watermark = '';
        // let PrintTypeId: number;
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.7in',
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
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
    }

    public async PrintIPCasesheet(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;
        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                Questions: question
            },
            SectionList: sec
        };

        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }
        for (let idx in sections) {
            let section = sections[idx];
            if (req.Data.Sectionid === section.SectionMaster.Id) {
                let resultValue: any = {};
                if (printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                    break; //Skip this section
                }
                switch (section.SectionMaster.SRef) {
                    case 'emr.cn.question':
                        resultValue = await this.GetCategorySectionEntry(section.SectionId, consultationId);
                        let maps: any = {};
                        for (var jdx in resultValue.map) {
                            let item: any = resultValue.map[jdx];
                            maps[item.CategoryId] = item.DisplayOrder;
                        }
                        let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                            section.SectionMaster.Name);
                        await this.FormatData(questionSecData);
                        info.SectionValues.Questions.push(questionSecData);
                        break;
                    default:
                        // Todo
                        break;
                }
            }
        }

        let key = 'ipcasesheet';

        return await Report.Generate(key, { header: {}, body: info });
    }
    public async PrintIndIPCasesheet(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: req.Id,
            Data: {}
        };
        let consultationId = req.Data.ConsultationId ? req.Data.ConsultationId : 0;
        let ipcasesheetId = req.Data.IPCasesheetId ? req.Data.IPCasesheetId : 0;
        let currentConsultation: any = await this.GetConsultationById(apiReq);
        let sec: Array<any> = [];
        let question: Array<any> = [];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(this.Session.FacilityId);

        let info = {
            Text: '',
            Title: '',
            Preferences: printPreferencesData,
            CurrentConsultation: currentConsultation,
            SectionValues: {
                Allergy: {},
                Condition: {},
                Vital: {},
                Procedure: {},
                Documents: {},
                Familyconditions: {},
                Socialhistory: {},
                Familysocialhistory: {},
                Immunization: {},
                Prescription: {},
                Order: {},
                Chiefcomplaint: {},
                Labresult: {},
                Radiologyresult: {},
                Questions: question
            },
            SectionList: sec
        };

        let sections = currentConsultation.ProfileMaster.ProfileSections;
        let printSections: any = {};
        if (currentConsultation.ProfileMaster.PrintConfig) {
            printSections = JSON.parse(currentConsultation.ProfileMaster.PrintConfig);
        }
        for (let idx in sections) {
            let section = sections[idx];
            if (req.Data.Sectionid === section.SectionMaster.Id) {
                let resultValue: any = {};
                if (printSections.PrintConfig.indexOf(section.SectionMaster.Id) === -1) {
                    break; //Skip this section
                }
                switch (section.SectionMaster.SRef) {
                    case 'emr.cn.question':
                        resultValue = await this.GetCategorySectionEntryForIpCaseSheet(section.SectionId, consultationId, ipcasesheetId);
                        let maps: any = {};
                        for (var jdx in resultValue.map) {
                            let item: any = resultValue.map[jdx];
                            maps[item.CategoryId] = item.DisplayOrder;
                        }
                        let questionSecData: any = await this.computeAnswers(resultValue.list, maps, section.SectionId,
                            section.SectionMaster.Name);
                        await this.FormatData(questionSecData);
                        info.SectionValues.Questions.push(questionSecData);
                        break;
                    default:
                        // Todo
                        break;
                }
            }
        }

        let key = 'ipcasesheet';

        return await Report.Generate(key, { header: {}, body: info });
    }
    public async FormatData(questionSecData: any) {
        for (var catidx in questionSecData.cat) {
            let category = questionSecData.cat[catidx];
            for (var cptidx in category.concepts) {
                let cpt = category.concepts[cptidx];
                if (cpt.IsMultiple) {
                    for (var termidx in cpt.Terms) {
                        if (cpt.Result === '') {
                            cpt.Result = cpt.Terms[termidx];
                        } else {
                            cpt.Result = cpt.Result + ', ' + cpt.Terms[termidx];
                        }
                    }
                    console.log(cpt.Result);
                }
                //Date
                if (cpt.ValueTypeId === 6) {
                    cpt.Result = moment(cpt.Result).format('DD-MM-YYYY');
                }
            }
        }
    }

    public async GetAllergies(patientId: number, consultationId: number) {
        let allergyReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientAllergyFilters.PatientId, Value: patientId },
                { Key: PatientAllergyFilters.ConsultationId, Value: consultationId }
            ]
        };
        let allergyBO = BoFactory.GetBo(emr.PatientAllergyBo, this.Request);
        return await allergyBO.GetPatientAllergys(allergyReq);
    }

    public async GetConditions(patientId: number, consultationId: number) {
        let condReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientConditionFilters.PatientId, Value: patientId },
                { Key: PatientConditionFilters.ConsultationId, Value: consultationId }
            ]
        };
        let conditionBo = BoFactory.GetBo(emr.PatientConditionBo, this.Request);
        return await conditionBo.GetPatientConditions(condReq);
    }

    public async GetVitals(patientId: number, consultationId: number) {
        let vitalReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientVitalFilters.PatientId, Value: patientId },
                { Key: PatientVitalFilters.ConsultationId, Value: consultationId }
            ]
        };
        let vitalBo = BoFactory.GetBo(emr.PatientVitalBo, this.Request);
        return await vitalBo.GetPatientVitals(vitalReq);
    }

    public async FormatVitalData(vitals: any) {
        for (var idx in vitals.Data) {
            var vital = vitals.Data[idx];
            vital.VitalValue = vital.VitalValue.replace('~', '/');
        }
    }

    public async TreatmentData(plans: any) {
        for (let idx in plans.Data) {
            let Plan = plans.Data[idx];
            if (Plan.TreatmentPlanDetails.length > 0) {
                let GroupedBatchData = _.groupBy(Plan.TreatmentPlanDetails, 'ServiceItemId');
                for (let dx in GroupedBatchData) {
                    let plandata = GroupedBatchData[dx];
                    if (!Plan.TreatmentName) {
                        Plan.TreatmentName = plandata[0].ServiceName;
                    } else {
                        Plan.TreatmentName += ',' + plandata[0].ServiceName;
                    }
                }
            }
            Plan.TreatmentName = Plan.TreatmentName;
        }
    }
    public async GetProcedures(patientId: number, consultationId: number) {
        let procedureReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientProcedureFilters.PatientId, Value: patientId },
                { Key: PatientProcedureFilters.ConsultationId, Value: consultationId }
            ]
        };
        let procedureBo = BoFactory.GetBo(emr.PatientProcedureBo, this.Request);
        return await procedureBo.GetPatientProcedures(procedureReq);
    }

    public async GetDocuments(patientId: number, consultationId: number) {
        let documentReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ClinicalDocumentFilters.PatientId, Value: patientId },
                { Key: ClinicalDocumentFilters.ConsultationId, Value: consultationId }
            ]
        };
        let documentBo = BoFactory.GetBo(emr.ClinicalDocumentBo, this.Request);
        return await documentBo.GetClinicalDocuments(documentReq);
    }

    public async GetFamilyConditions(patientId: number, consultationId: number) {
        let conditionReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: FamilyConditionFilters.PatientId, Value: patientId },
                { Key: FamilyConditionFilters.ConsultationId, Value: consultationId }
            ]
        };
        let famConditionBo = BoFactory.GetBo(emr.FamilyConditionBo, this.Request);
        return await famConditionBo.GetFamilyConditions(conditionReq);
    }

    public async GetSocialHistory(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientSocialHistoryFilters.PatientId, Value: patientId },
                { Key: PatientSocialHistoryFilters.ConsultationId, Value: consultationId }
            ]
        };
        let socialHistoryBo = BoFactory.GetBo(emr.PatientSocialHistoryBo, this.Request);
        return await socialHistoryBo.GetPatientSocialHistorys(Req);
    }

    public async GetFamilySocialHistory(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: FamilySocialHistoryFilters.PatientId, Value: patientId },
                { Key: FamilySocialHistoryFilters.ConsultationId, Value: consultationId }
            ]
        };
        let famSocialHistoryBo = BoFactory.GetBo(emr.FamilySocialHistoryBo, this.Request);
        return await famSocialHistoryBo.GetFamilySocialHistorys(Req);
    }

    public async GetImmunizations(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientImmunizationFilters.PatientId, Value: patientId },
                { Key: PatientImmunizationFilters.ConsultationId, Value: consultationId }
            ]
        };
        let immunizationBo = BoFactory.GetBo(emr.PatientImmunizationBo, this.Request);
        return await immunizationBo.GetPatientImmunizations(Req);
    }

    public async GetPrescriptions(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PrescriptionFilters.PatientId, Value: patientId },
                { Key: PrescriptionFilters.ConsultationId, Value: consultationId }
            ]
        };
        let prescriptionBo = BoFactory.GetBo(emr.PrescriptionBo, this.Request);
        return await prescriptionBo.GetPrescriptions(Req);
    }

    public async GetPatientAdviceMedications(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientAdviceMedicationFilters.PatientId, Value: patientId },
                { Key: PatientAdviceMedicationFilters.ConsultationId, Value: consultationId }
            ]
        };
        let PatientAdviceMedicationBo = BoFactory.GetBo(emr.PatientAdviceMedicationBo, this.Request);
        return await PatientAdviceMedicationBo.GetPatientAdviceMedications(Req);
    }

    public async GetOrders(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.PatientId, Value: patientId },
                { Key: PatientOrderFilters.ConsultationId, Value: consultationId }
            ]
        };
        let orderBo = BoFactory.GetBo(emr.PatientOrderBo, this.Request);
        return await orderBo.GetPatientOrders(Req);
    }

    public async GetConsPatientTrackers(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientTrackerFilters.PatientId, Value: patientId },
                { Key: PatientTrackerFilters.ConsultationId, Value: consultationId }
            ]
        };
        let trackerBo = BoFactory.GetBo(appbo.PatientTrackerBo, this.Request);
        return await trackerBo.GetPatientTrackers(Req);
    }

    public async GetConsTreatmentPlans(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: TreatmentPlanFilters.PatientId, Value: patientId },
                { Key: TreatmentPlanFilters.ConsultationId, Value: consultationId }
            ]
        };
        let planBo = BoFactory.GetBo(emr.TreatmentPlanBo, this.Request);
        return await planBo.GetTreatmentPlans(Req);
    }

    public async GetChiefComplaints(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientChiefComplaintFilters.PatientId, Value: patientId },
                { Key: PatientChiefComplaintFilters.ConsultationId, Value: consultationId }
            ]
        };
        let chiefComplaintBo = BoFactory.GetBo(emr.PatientChiefComplaintBo, this.Request);
        return await chiefComplaintBo.GetPatientChiefComplaints(Req);
    }
    public async GetMedications(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientDischargeMedicationFilters.PatientId, Value: patientId },
                { Key: PatientDischargeMedicationFilters.ConsultationId, Value: consultationId },
                { Key: PatientDischargeMedicationFilters.IsSelectedDrug, Value: true }
            ]
        };
        let medicationBo = BoFactory.GetBo(emr.PatientDischargeMedicationBo, this.Request);
        return await medicationBo.GetPatientDischargeMedications(Req);
    }
    public async GetOtNotes(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: SurgeryEntryFilters.PatientId, Value: patientId },
                { Key: SurgeryEntryFilters.ConsultationId, Value: consultationId }
            ]
        };
        let otManageBo = BoFactory.GetBo(otmangebo.SurgeryEntryBo, this.Request);
        return await otManageBo.GetSurgeryEntrys(Req);
    }
    public async GetLabResults(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.PatientId, Value: patientId },
                { Key: PatientOrderFilters.ConsultationId, Value: consultationId },
                { Key: PatientOrderFilters.TestType, Value: 1 },
                { Key: PatientOrderFilters.IncludeWOStatus, Value: '7,8,9' }
            ]
        };
        let patientOrderBo = BoFactory.GetBo(emr.PatientOrderBo, this.Request);
        let res: any = await patientOrderBo.GetPatientOrders(Req);
        let labresults = res.Data;
        for (let jdx in labresults) {
            for (let kdx in labresults[jdx].PatientWorkorders) {

                let result = labresults[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                let testArr = [];
                let tabIndex = 0;
                let profileName = '';
                let rootProfileName = '';
                for (let idx in result) {
                    let item = result[idx];

                    let found: any = testArr.find(function (t) {
                        return t.Testname === item.Testname;
                    });
                    if (!found) {
                        found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                        if (profileName !== item.ProfileName) {
                            profileName = item.ProfileName;
                            found.ProfileName = profileName;
                        }
                        if (rootProfileName !== item.RootProfileName) {
                            rootProfileName = item.RootProfileName;
                            found.RootProfileName = rootProfileName;
                        }
                        testArr.push(found);
                    }
                    item.tabIndex = tabIndex++;
                    found.details.push(item);
                }
                labresults[jdx].PatientWorkorders[kdx].woDetails = testArr;
            }
        }


        return await labresults;
    }

    public async GetDischargeLabResults(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.PatientId, Value: patientId },
                { Key: PatientOrderFilters.ConsultationId, Value: consultationId },
                { Key: PatientOrderFilters.TestType, Value: 1 },
                { Key: PatientOrderFilters.IncludeWOStatus, Value: '7,8,9' }
            ]
        };
        let patientOrderBo = BoFactory.GetBo(emr.PatientOrderBo, this.Request);
        let res: any = await patientOrderBo.GetPatientOrders(Req);
        let labresults = res.Data;
        var ApprovalSubmitDates = Array();
        for (let jdx in labresults) {
            for (let kdx in labresults[jdx].PatientWorkorders) {

                let result = labresults[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                let testArr = [];
                let tabIndex = 0;
                let profileName = '';
                let rootProfileName = '';

                for (let idx in result) {
                    let item = result[idx];
                    let ApprovalSubmisdateForHeader = labresults[jdx].PatientWorkorders[kdx].ApprovalSubmisdate;

                    let year = ApprovalSubmisdateForHeader.getFullYear();

                    let month = ApprovalSubmisdateForHeader.getMonth() + 1;
                    month = (month < 10 ? '0' : '') + month;

                    let day = ApprovalSubmisdateForHeader.getDate();
                    day = (day < 10 ? '0' : '') + day;

                    let ApprovalSubmissionDate = day + '/' + month + '/' + year;
                    ApprovalSubmitDates.push(ApprovalSubmissionDate);

                    let found: any = testArr.find(function (t) {
                        return t.Testname === item.Testname;
                    });
                    if (!found) {
                        found = {
                            Testid: item.Testid, Testname: item.Testname, details: []
                            , TestDisplayOrder: item.TestDisplayOrder, ApprovalSubmissionDate: ApprovalSubmissionDate
                        };
                        if (profileName !== item.ProfileName) {
                            profileName = item.ProfileName;
                            found.ProfileName = profileName;
                        }
                        if (rootProfileName !== item.RootProfileName) {
                            rootProfileName = item.RootProfileName;
                            found.RootProfileName = rootProfileName;
                        }
                        testArr.push(found);
                    }
                    item.tabIndex = tabIndex++;
                    found.details.push(item);
                }
                labresults[jdx].PatientWorkorders[kdx].woDetails = testArr;
            }
        }

        let wolabDetails = [];
        for (let jdx in labresults) {
            for (let kdx in labresults[jdx].PatientWorkorders) {
                let workorder = labresults[jdx].PatientWorkorders[kdx];
                let result = labresults[jdx].PatientWorkorders[kdx].woDetails;
                for (let idx in result) {
                    let test = result[idx];

                    let ApprovalSubmisdate = workorder.ApprovalSubmisdate;
                    let heading = '';
                    if (test.RootProfileName) {
                        if (!heading) heading += test.RootProfileName;
                        else heading += '/' + test.RootProfileName;
                    }
                    if (test.ProfileName) {
                        if (!heading) heading += test.ProfileName;
                        else heading += '/' + test.ProfileName;
                    }
                    if (test.details && test.details.length > 0) {
                        if (!(test.details.length === 1 && test.Testname.toLowerCase() === test.details[0].Analytename.toLowerCase())) {
                            if (!heading) heading += test.Testname;
                            else heading += '/' + test.Testname;
                        }
                    }
                    for (let idxdtls in test.details) {
                        if (test.details[idxdtls].Resultvalue) {
                            if (test.details[idxdtls].Resultvalue.length > 0 &&
                                test.details[idxdtls].IsIncludeDischargeSheet) {
                                test.details[idxdtls].ApprovalSubmisdate = ApprovalSubmisdate;
                                test.details[idxdtls].heading = heading;
                                break;
                            }
                        }
                    }

                    let testdetails = test.details;
                    test.details = [];
                    for (let idxdtls in testdetails) {
                        if (testdetails[idxdtls].Resultvalue) {
                            if (testdetails[idxdtls].Resultvalue.length > 0 &&
                                testdetails[idxdtls].IsIncludeDischargeSheet) {
                                test.details.push(testdetails[idxdtls]);
                            }
                        }
                    }

                    wolabDetails.push(test);

                }
            }
        }

        let UniqueApprovalDates = [];
        for (let i = 0; i < ApprovalSubmitDates.length; i++) {
            if (UniqueApprovalDates.indexOf(ApprovalSubmitDates[i]) === -1) {
                UniqueApprovalDates.push(ApprovalSubmitDates[i]);
            }
        }

        let LabResultsWithDate = [];
        for (var index in UniqueApprovalDates) {
            var UniqueApprovalDate = UniqueApprovalDates[index];
            let LabResultWithDate = [];
            for (var index1 in wolabDetails) {
                var LabResult = wolabDetails[index1];
                if (UniqueApprovalDate === LabResult.ApprovalSubmissionDate) {
                    LabResultWithDate.push(LabResult);
                }
            }

            var Data = {
                UniqueApprovalDate: UniqueApprovalDate,
                LabResultWithDate: LabResultWithDate
            };
            LabResultsWithDate.push(Data);
        }

        return await LabResultsWithDate;
    }

    public async GetRadiologyResults(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.PatientId, Value: patientId },
                { Key: PatientOrderFilters.ConsultationId, Value: consultationId },
                { Key: PatientOrderFilters.TestType, Value: 2 },
                { Key: PatientOrderFilters.IncludeWOStatus, Value: '7,8,9' }
            ]
        };
        let patientOrderBo = BoFactory.GetBo(emr.PatientOrderBo, this.Request);
        let res: any = await patientOrderBo.GetPatientOrders(Req);
        let radiologyresults = res.Data;
        for (let jdx in radiologyresults) {
            for (let kdx in radiologyresults[jdx].PatientWorkorders) {
                let result = radiologyresults[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                let testArr = [];
                let tabIndex = 0;
                let profileName = '';
                let rootProfileName = '';
                for (let idx in result) {
                    let item = result[idx];

                    let found: any = testArr.find(function (t) {
                        return t.Testname === item.Testname;
                    });
                    if (!found) {
                        found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                        if (profileName !== item.ProfileName) {
                            profileName = item.ProfileName;
                            found.ProfileName = profileName;
                        }
                        if (rootProfileName !== item.RootProfileName) {
                            rootProfileName = item.RootProfileName;
                            found.RootProfileName = rootProfileName;
                        }
                        testArr.push(found);
                    }
                    item.tabIndex = tabIndex++;
                    found.details.push(item);
                }
                radiologyresults[jdx].PatientWorkorders[kdx].woDetails = testArr;
            }
        }
        return radiologyresults;
    }

    public async GetDischargeRadiologyResults(patientId: number, consultationId: number) {
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.PatientId, Value: patientId },
                { Key: PatientOrderFilters.ConsultationId, Value: consultationId },
                { Key: PatientOrderFilters.TestType, Value: 2 },
                { Key: PatientOrderFilters.IncludeWOStatus, Value: '7,8,9' }
            ]
        };
        let patientOrderBo = BoFactory.GetBo(emr.PatientOrderBo, this.Request);
        let res: any = await patientOrderBo.GetPatientOrders(Req);
        let radiologyresults = res.Data;
        for (let jdx in radiologyresults) {
            for (let kdx in radiologyresults[jdx].PatientWorkorders) {
                let result = radiologyresults[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                let testArr = [];
                let tabIndex = 0;
                let profileName = '';
                let rootProfileName = '';
                for (let idx in result) {
                    let item = result[idx];

                    let found: any = testArr.find(function (t) {
                        return t.Testname === item.Testname;
                    });
                    if (!found) {
                        found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                        if (profileName !== item.ProfileName) {
                            profileName = item.ProfileName;
                            found.ProfileName = profileName;
                        }
                        if (rootProfileName !== item.RootProfileName) {
                            rootProfileName = item.RootProfileName;
                            found.RootProfileName = rootProfileName;
                        }
                        testArr.push(found);
                    }
                    item.tabIndex = tabIndex++;
                    found.details.push(item);
                }
                radiologyresults[jdx].PatientWorkorders[kdx].woDetails = testArr;
            }
        }


        let wolabDetails = [];
        for (let jdx in radiologyresults) {
            for (let kdx in radiologyresults[jdx].PatientWorkorders) {
                let workorder = radiologyresults[jdx].PatientWorkorders[kdx];
                let result = radiologyresults[jdx].PatientWorkorders[kdx].woDetails;
                for (let idx in result) {
                    let test = result[idx];

                    let ApprovalSubmisdate = workorder.ApprovalSubmisdate;
                    let heading = '';
                    if (test.RootProfileName) {
                        if (!heading) heading += test.RootProfileName;
                        else heading += '/' + test.RootProfileName;
                    }
                    if (test.ProfileName) {
                        if (!heading) heading += test.ProfileName;
                        else heading += '/' + test.ProfileName;
                    }
                    if (test.details && test.details.length > 0) {
                        if (!(test.details.length === 1 && test.Testname.toLowerCase() === test.details[0].Analytename.toLowerCase())) {
                            if (!heading) heading += test.Testname;
                            else heading += '/' + test.Testname;
                        }
                    }
                    for (let idxdtls in test.details) {
                        if (test.details[idxdtls].Resultvalue) {
                            if (test.details[idxdtls].Resultvalue.length > 0 &&
                                test.details[idxdtls].IsIncludeDischargeSheet) {
                                test.details[idxdtls].ApprovalSubmisdate = ApprovalSubmisdate;
                                test.details[idxdtls].heading = heading;
                                break;
                            }
                        }
                    }

                    let testdetails = test.details;
                    test.details = [];
                    for (let idxdtls in testdetails) {
                        if (testdetails[idxdtls].Resultvalue) {
                            if (testdetails[idxdtls].Resultvalue.length > 0 &&
                                testdetails[idxdtls].IsIncludeDischargeSheet) {
                                test.details.push(testdetails[idxdtls]);
                            }
                        }
                    }

                    wolabDetails.push(test);

                }
            }
        }


        return await wolabDetails;
    }

    public async GetCategorySectionEntry(sectionId: number, consultationId: number) {
        let req: BaseRequest = {
            Id: 0,
            Data: {
                sectionid: sectionId,
                consultationid: consultationId
            }
        };
        let catSectionEntryBO = BoFactory.GetBo(emr.CategorySectionEntryBo, this.Request);
        return await catSectionEntryBO.GetCategorySectionEntrysForReview(req);
    }
    public async GetCategorySectionEntryForIpCaseSheet(sectionId: number, consultationId: number, ipcasesheetId: number) {
        let req: BaseRequest = {
            Id: 0,
            Data: {
                sectionid: sectionId,
                consultationid: consultationId,
                ipcasesheetid: ipcasesheetId
            }
        };
        let catSectionEntryBO = BoFactory.GetBo(emr.CategorySectionEntryBo, this.Request);
        return await catSectionEntryBO.GetCategorySectionEntrysForReview(req);
    }
    public async GetCategorySectionEntryForOtRegister(sectionId: number, consultationId: number, otregisterid: number) {
        let req: BaseRequest = {
            Id: 0,
            Data: {
                sectionid: sectionId,
                consultationid: consultationId,
                otregisterid: otregisterid
            }
        };
        let catSectionEntryBO = BoFactory.GetBo(emr.CategorySectionEntryBo, this.Request);
        return await catSectionEntryBO.GetCategorySectionEntrysForReview(req);
    }
    public async computeAnswers(data: any, displayOrderMap: any, sectionId: number, sectionName: string) {
        let emptyCatArr: Array<any> = [];
        let questionSectionData: any = { sectionName: sectionName, cat: emptyCatArr };
        let categoryGrouped: any = _.groupBy(data, 'CategoryKey');
        for (var catKey in categoryGrouped) {
            let emptyConceptArr: Array<any> = [];
            let cat: any = { CategoryName: {}, concepts: emptyConceptArr };
            // let concepts = categoryGrouped[catKey];
            let concepts = _.sortBy(categoryGrouped[catKey], 'Concept.DisplayOrder');
            cat.CategoryName = concepts[0].Category.CategoryName;
            cat.IsPrint = concepts[0].Category.IsPrint;
            let categoryId = concepts[0].Category.Id;
            cat.DisplayOrder = displayOrderMap[categoryId];


            for (var idx in concepts) {
                let concept: any = concepts[idx];
                let result: any = '';
                let item: any = {};
                // if(concept.Concept) {
                switch (concept.Concept.ValueTypeId) {
                    case 3: //Term
                        if (concept.Concept.IsMultiple === false && concept.ResultValue) {
                            if (concept.Comments) {
                                result = concept.ResultValue + ' - ' + concept.Comments;
                            } else {
                                result = concept.ResultValue;
                            }
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId, IsMultiple: concept.Concept.IsMultiple,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        } else if (concept.Concept.IsMultiple === true) {
                            await this.processTermBasedMulti(concept, cat);
                        }
                        break;
                    case 4: //boolean
                        if (concept.ResultValue || concept.ResultValue === '0') {
                            result = concept.ResultValue === '1' ? 'Yes' : 'No';
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        }
                        break;
                    case 5: //boolean
                        if (concept.ResultValue || concept.ResultValue === '0') {
                            result = concept.ResultValue === '1' ? 'Yes' : 'No';
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        }
                        break;
                    case 6: //date
                        if (concept.ResultValue) {
                            result = concept.ResultValue ? concept.ResultValue : '';
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        }
                        break;
                    case 8: //notes
                        if (concept.ResultValueRichText) {
                            result = concept.ResultValueRichText ? concept.ResultValueRichText : '';
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        }
                        break;
                    case 10: //icd
                        if (concept.ResultValueJSON && concept.ResultValueJSON !== '' &&
                            concept.ResultValueJSON !== null && concept.ResultValueJSON !== undefined) {
                            result = concept.ResultValueJSON ? JSON.parse(concept.ResultValueJSON) : '';
                            if (result) {
                                if (result.length > 0) {
                                    var Diagnosis = '';
                                    for (var indx in result) {
                                        var diagnosisname = result[indx].DiagnosisName;
                                        Diagnosis += diagnosisname + ',';
                                    }
                                }
                            }
                            var item1 = {
                                ConceptName: concept.Concept.ConceptName, Result: Diagnosis,
                                ValueTypeId: concept.Concept.ValueTypeId
                            };
                            cat.concepts.push(item1);
                        }
                        break;
                    case 12: //ckeditor
                        if (concept.ResultValueRichText) {
                            result = concept.ResultValueRichText ? concept.ResultValueRichText : '';
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        }
                        break;
                    default:
                        if (concept.ResultValue) {
                            result = concept.ResultValue ? concept.ResultValue : '';
                            item = {
                                ConceptName: concept.Concept.ConceptName, Result: result,
                                ValueTypeId: concept.Concept.ValueTypeId,
                                IPCasesheetId: concept.IPCasesheetId || 0
                            };
                            cat.concepts.push(item);
                        }
                }
                //}
            }
            let finalConcepts = [];
            for (var jdx in cat.concepts) {
                var cpt = cat.concepts[jdx];
                if (cpt.ValueTypeId === 3 && cpt.IsMultiple === true) {
                    if (cpt.Terms && cpt.Terms.length > 0) {
                        finalConcepts.push(cpt);
                    }
                } else {
                    finalConcepts.push(cpt);
                }
            }
            cat.concepts = finalConcepts;
            if (cat && cat.concepts && cat.concepts.length > 0) {
                questionSectionData.cat.push(cat);
            }
        }
        questionSectionData.cat = _.orderBy(questionSectionData.cat, ['DisplayOrder']);
        return questionSectionData;
    }

    public async processTermBasedMulti(concept: any, categoryToAdd: any) {
        let item: any = null;
        for (var idx in categoryToAdd.concepts) {
            let existingConcept: any = categoryToAdd.concepts[idx];
            if (existingConcept.ConceptName === concept.Concept.ConceptName) {
                item = existingConcept;
                break;
            }
        }

        if (!item) {
            item = {
                ConceptName: concept.Concept.ConceptName, Result: '',
                ValueTypeId: concept.Concept.ValueTypeId, IsMultiple: concept.Concept.IsMultiple,
                Terms: []
            };
            categoryToAdd.concepts.push(item);
        }
        if (concept.ResultValue === '1') {
            var termname = '';
            if (concept.Comments) {
                termname = concept.TermName + ' - ' + concept.Comments;
            } else {
                termname = concept.TermName;
            }
            item.Terms.push(termname);
        }
    }

    public GetModel(): SStatic.Model<ConsultationInstance, ConsultationAttributes> {
        return this.Models.Consultation;
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let ConsultCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'ConsultCount': ConsultCount
        };
    }
}
