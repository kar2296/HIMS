import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OccupationInstance, OccupationAttributes } from '../Model/Interface/Index';
import { OccupationFilters } from '../Common/Filters.e';

export class OccupationBo extends BaseBo<OccupationInstance, OccupationAttributes> implements IOptionProvider {
    public async AddOccupation(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOccupation(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOccupationById(req: BaseRequest): Promise<OccupationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOccupations(apiReq?: ApiRequest<OccupationFilters>): Promise<ApiResponse<OccupationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('OccupationType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OccupationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OccupationFilters.OccupationTypeId:
                        where['OccupationTypeId'] = param.Value;
                        break;
                    case OccupationFilters.Occupations:
                        (where as any)[Op.or] = [{ Occupations: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case OccupationFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteOccupation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OccupationInstance, OccupationAttributes> {
        return this.Models.Occupation;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OccupationFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Occupations', 'Text'], 'Occupations', 'Code'];
        let val = await this.GetOccupations(apiReq);
        return { [key]: val.Data };
    }
}
