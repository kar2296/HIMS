import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { RadiationBatchesInstance, RadiationBatchesAttributes } from '../Model/Interface/Index';
import { RadiationBatchesFilters } from '../Common/Filters.e';

export class RadiationBatchesBo extends BaseBo<RadiationBatchesInstance, RadiationBatchesAttributes> implements IOptionProvider {
    public async AddRadiationBatches(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRadiationBatches(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetRadiationBatchesById(req: BaseRequest): Promise<RadiationBatchesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRadiationBatchess(apiReq?: ApiRequest<RadiationBatchesFilters>): Promise<ApiResponse<RadiationBatchesAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('AssetType'));
        // include.push(this.GetReference(''));
        // include.push(this.GetReference('ModelId'));
        // include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RadiationBatchesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RadiationBatchesFilters.CostDetailId:
                        where['CostDetailId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteRadiationBatches(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<RadiationBatchesFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetRadiationBatchess(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<RadiationBatchesInstance, RadiationBatchesAttributes> {
        return this.Models.RadiationBatches;
    }
}
