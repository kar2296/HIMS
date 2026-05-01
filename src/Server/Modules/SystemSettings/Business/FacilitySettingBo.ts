import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FacilitySettingInstance, FacilitySettingAttributes } from '../Model/Interface/Index';
import { FacilitySettingFilters } from '../Common/Filters.e';

export class FacilitySettingBo extends BaseBo<FacilitySettingInstance, FacilitySettingAttributes>  {
    public async AddFacilitySetting(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFacilitySetting(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFacilitySettingById(req: BaseRequest): Promise<FacilitySettingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFacilitySettings(apiReq?: ApiRequest<FacilitySettingFilters>): Promise<ApiResponse<FacilitySettingAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FacilitySettingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FacilitySettingFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case FacilitySettingFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFacilitySetting(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FacilitySettingInstance, FacilitySettingAttributes> {
        return this.Models.FacilitySetting;
    }

}
