import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DailyNoteInstance, DailyNoteAttributes } from '../Model/Interface/Index';
import { DailyNoteFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';

export class DailyNoteBo extends BaseBo<DailyNoteInstance, DailyNoteAttributes>  {
    public async AddDailyNote(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDailyNote(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDailyNoteById(req: BaseRequest): Promise<DailyNoteAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDailyNotes(apiReq?: ApiRequest<DailyNoteFilters>): Promise<ApiResponse<DailyNoteAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('Note', ['Description', 'ColorCode']));
        include.push(this.GetReference('NoteStatus'));
        include.push({
            model: this.Models.User, as: 'CapturedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push({
            model: this.Models.Encounter,
            required: false,
            include: [
                { model: this.Models.WardMaster, required: false },
                { model: this.Models.WardRoomMaster, required: false },
                { model: this.Models.WardRoomBedMaster, required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DailyNoteFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DailyNoteFilters.NoteTypeId:
                        where['NoteTypeId'] = param.Value;
                        break;
                    case DailyNoteFilters.CapturedBy:
                        where['CapturedBy'] = param.Value;
                        break;
                    case DailyNoteFilters.NoteStatusId:
                        where['NoteStatusId'] = param.Value;
                        break;
                    case DailyNoteFilters.CapturedOn:
                        where['CapturedOn'] = { '$between': param.Value || '' };
                        break;
                    case DailyNoteFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case DailyNoteFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case DailyNoteFilters.From:
                        where['CapturedOn'] = where['CapturedOn'] || {};
                        (where['CapturedOn'] as any)['$gte'] = param.Value;
                        break;
                    case DailyNoteFilters.To:
                        where['CapturedOn'] = where['CapturedOn'] || {};
                        (where['CapturedOn'] as any)['$lte'] = param.Value;
                        break;
                    case DailyNoteFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CapturedOn', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async PrintDailyNotes(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: DailyNoteFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetDailyNotes(apiReq);
        let DailyNotes = data.Data[0];
        let DailyNoteslist = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DailyNotes.FacilityId);
        let info = {
            DailyNotes: DailyNotes,
            Encounter: Encounter,
            DailyNoteslist: DailyNoteslist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('dailynotes', { header: {}, body: info });
    }
    public async DeleteDailyNote(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DailyNoteInstance, DailyNoteAttributes> {
        return this.Models.DailyNote;
    }
}
