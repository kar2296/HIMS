import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DrugFrequencyCategoryInstance, DrugFrequencyCategoryAttributes } from '../Model/Interface/Index';
import { DrugFrequencyCategoryFilters } from '../Common/Filters.e';

export class DrugFrequencyCategoryBo extends BaseBo<DrugFrequencyCategoryInstance, DrugFrequencyCategoryAttributes>  {
    public async AddDrugFrequencyCategory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDrugFrequencyCategory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDrugFrequencyCategoryById(req: BaseRequest): Promise<DrugFrequencyCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDrugFrequencyCategorys(apiReq?: ApiRequest<DrugFrequencyCategoryFilters>):
        Promise<ApiResponse<DrugFrequencyCategoryAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('FrequencyCategory'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DrugFrequencyCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DrugFrequencyCategoryFilters.DrugFrequencyId:
                        where['DrugFrequencyId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDrugFrequencyCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DrugFrequencyCategoryInstance, DrugFrequencyCategoryAttributes> {
        return this.Models.DrugFrequencyCategory;
    }

}
