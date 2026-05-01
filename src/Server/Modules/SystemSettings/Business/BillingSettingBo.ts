import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BillingSettingInstance, BillingSettingAttributes } from '../Model/Interface/Index';
import { BillingSettingFilters } from '../Common/Filters.e';

export class BillingSettingBo extends BaseBo<BillingSettingInstance, BillingSettingAttributes>  {
    public async AddBillingSetting(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBillingSetting(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetBillingSettingById(req: BaseRequest): Promise<BillingSettingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetBillingSettings(apiReq?: ApiRequest<BillingSettingFilters>): Promise<ApiResponse<BillingSettingAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case BillingSettingFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case BillingSettingFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBillingSetting(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<BillingSettingInstance, BillingSettingAttributes> {
        return this.Models.BillingSetting;
    }

}
