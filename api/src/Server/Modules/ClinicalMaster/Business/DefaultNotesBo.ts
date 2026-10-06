import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DefaultNotesInstance, DefaultNotesAttributes } from '../Model/Interface/Index';
import { DefaultNotesFilters } from '../Common/Filters.e';

export class DefaultNotesBo extends BaseBo<DefaultNotesInstance, DefaultNotesAttributes> {
    public async AddDefaultNotes(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDefaultNotes(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDefaultNotesById(req: BaseRequest): Promise<DefaultNotesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDefaultNotess(apiReq?: ApiRequest<DefaultNotesFilters>): Promise<ApiResponse<DefaultNotesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DefaultNoteType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DefaultNotesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DefaultNotesFilters.DefaultNoteType:
                        where['DefaultNoteTypeId'] = param.Value;
                        break;
                    case DefaultNotesFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDefaultNotes(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DefaultNotesInstance, DefaultNotesAttributes> {
        return this.Models.DefaultNotes;
    }
}
