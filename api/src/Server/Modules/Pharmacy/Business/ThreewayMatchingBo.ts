import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ThreewayMatchingInstance, ThreewayMatchingAttributes } from '../Model/Interface/Index';
import { ThreewayMatchingFilters } from '../Common/Filters.e';

export class ThreewayMatchingBo extends BaseBo<ThreewayMatchingInstance, ThreewayMatchingAttributes> {
    public async AddThreewayMatching(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateThreewayMatching(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetThreewayMatchingById(req: BaseRequest): Promise<ThreewayMatchingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetThreewayMatching(apiReq?: ApiRequest<ThreewayMatchingFilters>): Promise<ApiResponse<ThreewayMatchingAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ThreewayMatchingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                   default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteThreewayMatching(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ThreewayMatchingInstance, ThreewayMatchingAttributes> {
        return this.Models.ThreewayMatching;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ThreewayMatchingFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['GstName', 'Text'], 'GstName', 'GstCode', 'GstPercentage'];
        let val = await this.GetThreewayMatching(apiReq);
        return { [key]: val.Data };
    }
}
