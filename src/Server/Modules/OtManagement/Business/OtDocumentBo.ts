import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OtDocumentInstance, OtDocumentAttributes } from '../Model/Interface/Index';
import { OtDocumentFilters } from '../Common/Filters.e';
import { SurgeryEntryFilters, OtNotesFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as SurgeryEntrybo from '../Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as patientbo from '../../Registration/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientFilters } from '../../Registration/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class OtDocumentBo extends BaseBo<OtDocumentInstance, OtDocumentAttributes>  {
    public async AddOtDocument(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOtDocument(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOtDocumentById(req: BaseRequest): Promise<OtDocumentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOtDocuments(apiReq?: ApiRequest<OtDocumentFilters>): Promise<ApiResponse<OtDocumentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('YesNo'));
        include.push(this.GetReference('DocumentType'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case OtDocumentFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case OtDocumentFilters.SurgeryEntryId:
                    where['SurgeryEntryId'] = param.Value;
                    break;
                case OtDocumentFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case OtDocumentFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async printOtDocuments(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: OtDocumentFilters.SurgeryEntryId, Value: req.Id }]
        };
        let data = await this.GetOtDocuments(apiReq);
        let OtDocuments: any = data.Data[0];
        let OtDocumentsDetail: any = data.Data;
        let SurgeryEntryReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.Id, Value: OtDocuments.OTRegisterId }]
        };
        let SurgeryEntryBo = BoFactory.GetBo(SurgeryEntrybo.SurgeryEntryBo, this.Request);
        let SurgeryEntryData = await SurgeryEntryBo.GetSurgeryEntrys(SurgeryEntryReq);
        let SurgeryEntry = SurgeryEntryData.Data[0];
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: OtDocuments.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let patientReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: OtDocuments.PatientId }]
        };
        let PatientBo = BoFactory.GetBo(patientbo.PatientBo, this.Request);
        let PatientData = await PatientBo.GetPatients(patientReq);
        let Patient = PatientData.Data[0];

        let OtNotesReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: OtNotesFilters.PatientId, Value: OtDocuments.PatientId },
            { Key: OtNotesFilters.EncounterId, Value: OtDocuments.EncounterId },
            { Key: OtNotesFilters.SurgeryEntryId, Value: OtDocuments.SurgeryEntryId },
            { Key: OtNotesFilters.OtNoteTypeId, Value: 2 }
            ]
        };
        let OtNotesBo = BoFactory.GetBo(SurgeryEntrybo.OtNotesBo, this.Request);
        let OtNotesData = await OtNotesBo.GetOtNotess(OtNotesReq);
        let OtNotes = OtNotesData.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);

        let info = {
            OtDocument: OtDocuments,
            OtDocumentsDetail: OtDocumentsDetail,
            SurgeryEntry: SurgeryEntry,
            Encounter: Encounter,
            Patient: Patient,
            OtNotes: OtNotes,
            Preferences: printPreferencesData
        };
        return await Report.Generate('otdocuments', { header: {}, body: info });
    }

    public async DeleteOtDocument(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OtDocumentInstance, OtDocumentAttributes> {
        return this.Models.OtDocument;
    }

}
