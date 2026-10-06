import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientSickLeaveFormInstance, PatientSickLeaveFormAttributes } from '../Model/Interface/Index';
import { PatientSickLeaveFormFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Registration/Business/Index';
import { PatientFilters } from '../../Registration/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import * as emr from '../../EMR/Business/Index';
import { join } from 'path';
import {
    PatientClinicalNotesFilters, PatientConditionFilters
} from '../../EMR/Common/Filters.e';
export class PatientSickLeaveFormBo extends BaseBo<PatientSickLeaveFormInstance, PatientSickLeaveFormAttributes>  {
    public async AddPatientSickLeaveForm(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        if (!req.Data.LeaveFormNumber && req.Data.FormTypeId === 1) {
            req.Data.LeaveFormNumber =  await Sequence.Next(SequenceKeys.PatientSickLeaveFormId);
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientSickLeaveForm(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientSickLeaveFormById(req: BaseRequest): Promise<PatientSickLeaveFormAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientSickLeaveForm(apiReq?:
        ApiRequest<PatientSickLeaveFormFilters>):
        Promise<ApiResponse<PatientSickLeaveFormAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: false,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
            required: false
        });
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName', 'SignPath'], as: 'Doctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientSickLeaveFormFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientSickLeaveFormFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientSickLeaveFormFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientSickLeaveFormFilters.FormTypeId:
                        where['FormTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order  });
    }

    public async DeletePatientSickLeaveForm(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientSickLeaveFormInstance, PatientSickLeaveFormAttributes> {
        return this.Models.PatientSickLeaveForm;
    }

    public async PrintPatientSickLeaveForm(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientSickLeaveFormFilters.Id, Value: req.Id }]
        };
        let PatientSickLeavedata = await this.GetPatientSickLeaveForm(apiReq);
        let PatientSickLeaveForm = PatientSickLeavedata.Data[0];

        let patientReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: PatientSickLeaveForm.PatientId }]
        };

        let PatientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let data = await PatientBo.GetPatients(patientReq);
        let PatientData = data.Data[0];

        let encounterReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientSickLeaveForm.EncounterId }]
        };
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterData = await encounterBO.GetEncounters(encounterReq);
        let PatientEncounter = EncounterData.Data[0];

        let chiefcomplaintReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientClinicalNotesFilters.PatientId, Value: PatientSickLeaveForm.PatientId },
            { Key: PatientClinicalNotesFilters.EncounterId, Value: PatientSickLeaveForm.EncounterId }
            ]
        };

        let PatientClinicalNotesBo = BoFactory.GetBo(emr.PatientClinicalNotesBo, this.Request);
        let PatientClinicalNotesData = await PatientClinicalNotesBo.GetPatientClinicalNotess(chiefcomplaintReq);
        let PatientClinicalNotes = PatientClinicalNotesData.Data[0];
        let PatientClinicalNotesValue = '';
        if (PatientClinicalNotes) {
            PatientClinicalNotesValue = PatientClinicalNotes.ChiefComplaints;
        }
        let combinechiefcomplaintLine1 = '';
        let combinechiefcomplaintLine2 = '';
        let combinechiefcomplaintLine3 = '';
        if (PatientClinicalNotesValue) {
        if (PatientClinicalNotesValue.length > 0) {
            combinechiefcomplaintLine1 = PatientClinicalNotesValue.substring(0, 60);
            combinechiefcomplaintLine2 = PatientClinicalNotesValue.substring(61, 120);
            combinechiefcomplaintLine3 = PatientClinicalNotesValue.substring(121, 200);
        }

        }
        let DiagnosisReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientConditionFilters.PatientId, Value: PatientSickLeaveForm.PatientId },
            { Key: PatientConditionFilters.EncounterId, Value: PatientSickLeaveForm.EncounterId }
            ]
        };

        let PatientConditionBo = BoFactory.GetBo(emr.PatientConditionBo, this.Request);
        let PatientConditionData = await PatientConditionBo.GetPatientConditions(DiagnosisReq);
        let PatientCondition = PatientConditionData.Data[0];
        let PatientConditionValue = '';
        let PatientConditionCodeValue = '';
        if (PatientCondition) {
            PatientConditionValue = PatientCondition.DiagnosisName;
        }
        if (PatientCondition) {
            PatientConditionCodeValue = PatientCondition.Code;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientData.FacilityId);
        let info = {
            PatientSickLeaveForm: PatientSickLeaveForm,
            Patient: PatientData,
            Encounter: PatientEncounter,
            PatientClinicalNotesValue: PatientClinicalNotesValue,
            combinechiefcomplaintLine1: combinechiefcomplaintLine1,
            combinechiefcomplaintLine2: combinechiefcomplaintLine2,
            combinechiefcomplaintLine3: combinechiefcomplaintLine3,
            PatientConditionValue: PatientConditionValue,
            PatientConditionCodeValue: PatientConditionCodeValue,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'sickleaveform';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '0in',
                contents: '',
            },
            footer: {
                height: '0in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',

            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
