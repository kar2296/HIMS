import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FrequencyCategoryInstance, FrequencyCategoryAttributes } from '../Model/Interface/Index';
import { FrequencyCategoryFilters } from '../Common/Filters.e';

export class FrequencyCategoryBo extends BaseBo<FrequencyCategoryInstance, FrequencyCategoryAttributes>  {
    public async AddFrequencyCategory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFrequencyCategory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFrequencyCategoryById(req: BaseRequest): Promise<FrequencyCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFrequencyCategorys(apiReq?: ApiRequest<FrequencyCategoryFilters>):
     Promise<ApiResponse<FrequencyCategoryAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ClinicalFrequencyCategory'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FrequencyCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FrequencyCategoryFilters.FrequencyId:
                        where['FrequencyId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFrequencyCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FrequencyCategoryInstance, FrequencyCategoryAttributes> {
        return this.Models.FrequencyCategory;
    }

}
