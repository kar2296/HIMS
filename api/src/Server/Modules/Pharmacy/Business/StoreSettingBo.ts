import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StoreSettingInstance, StoreSettingAttributes } from '../Model/Interface/Index';
import { StoreSettingFilters } from '../Common/Filters.e';

export class StoreSettingBo extends BaseBo<StoreSettingInstance, StoreSettingAttributes> {
    public async AddStoreSetting(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStoreSetting(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetStoreSettingById(req: BaseRequest): Promise<StoreSettingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStoreSettings(apiReq?: ApiRequest<StoreSettingFilters>): Promise<ApiResponse<StoreSettingAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        //include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        //include.push({ model: this.Models.StoreMaster, attributes: ['StoreName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StoreSettingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StoreSettingFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StoreSettingFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StoreSettingFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStoreSetting(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StoreSettingInstance, StoreSettingAttributes> {
        return this.Models.StoreSetting;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StoreSettingFilters>): Promise<any> {
        let val = await this.GetStoreSettings(apiReq);
        return { [key]: val.Data };
    }
}
