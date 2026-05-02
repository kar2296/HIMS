import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StorePreferenceMasterInstance, StorePreferenceMasterAttributes } from '../Model/Interface/Index';
import { StorePreferenceMasterFilters } from '../Common/Filters.e';

export class StorePreferenceMasterBo extends BaseBo<StorePreferenceMasterInstance, StorePreferenceMasterAttributes>  {
    public async AddStorePreferenceMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStorePreferenceMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetStorePreferenceMasterById(req: BaseRequest): Promise<StorePreferenceMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAllPreferences(req: BaseRequest): Promise<StorePreferenceMasterAttributes[]> {
        let result = await this.FindAll({});
        return this.GetAttributes(result);
    }

    public async GetStorePreferenceMasters(apiReq?: ApiRequest<StorePreferenceMasterFilters>):
        Promise<ApiResponse<StorePreferenceMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case StorePreferenceMasterFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case StorePreferenceMasterFilters.Category:
                    where['Category'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStorePreferenceMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StorePreferenceMasterInstance, StorePreferenceMasterAttributes> {
        return this.Models.StorePreferenceMaster;
    }

}
