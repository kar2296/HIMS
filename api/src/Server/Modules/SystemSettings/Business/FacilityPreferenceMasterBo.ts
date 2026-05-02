import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FacilityPreferenceMasterInstance, FacilityPreferenceMasterAttributes } from '../Model/Interface/Index';
import { FacilityPreferenceMasterFilters } from '../Common/Filters.e';

export class FacilityPreferenceMasterBo extends BaseBo<FacilityPreferenceMasterInstance, FacilityPreferenceMasterAttributes>  {
    public async AddFacilityPreferenceMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFacilityPreferenceMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFacilityPreferenceMasterById(req: BaseRequest): Promise<FacilityPreferenceMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAllPreferences(req: BaseRequest): Promise<FacilityPreferenceMasterAttributes[]> {
        let result = await this.FindAll({});
        return this.GetAttributes(result);
    }

    public async GetFacilityPreferenceMasters(apiReq?: ApiRequest<FacilityPreferenceMasterFilters>):
        Promise<ApiResponse<FacilityPreferenceMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case FacilityPreferenceMasterFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case FacilityPreferenceMasterFilters.Category:
                    where['Category'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFacilityPreferenceMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FacilityPreferenceMasterInstance, FacilityPreferenceMasterAttributes> {
        return this.Models.FacilityPreferenceMaster;
    }

}
