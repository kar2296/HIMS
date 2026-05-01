import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OtNotesInstance, OtNotesAttributes } from '../Model/Interface/Index';
import { OtNotesFilters } from '../Common/Filters.e';

export class OtNotesBo extends BaseBo<OtNotesInstance, OtNotesAttributes> {
    public async AddOtNotes(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOtNotes(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOtNotesById(req: BaseRequest): Promise<OtNotesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOtNotess(apiReq?: ApiRequest<OtNotesFilters>): Promise<ApiResponse<OtNotesAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any>= {};
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OtNotesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OtNotesFilters.SurgeryEntryId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case OtNotesFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OtNotesFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case OtNotesFilters.OtNoteTypeId:
                        where['OtNoteTypeId'] = param.Value;
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
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteOtNotes(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OtNotesInstance, OtNotesAttributes> {
        return this.Models.OtNotes;
    }
}
