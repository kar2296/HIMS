import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ReferralChargeInstance, ReferralChargeAttributes } from '../Model/Interface/Index';
import { ReferralChargeFilters } from '../Common/Filters.e';

export class ReferralChargeBo extends BaseBo<ReferralChargeInstance, ReferralChargeAttributes> implements IOptionProvider {
    public async AddReferralCharge(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateReferralCharge(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetReferralChargeById(req: BaseRequest): Promise<ReferralChargeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetReferralCharges(apiReq?: ApiRequest<ReferralChargeFilters>): Promise<ApiResponse<ReferralChargeAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
      include.push(this.GetReference('DiscountMode'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ReferralChargeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ReferralChargeFilters.ReferralId:
                        where['ReferralId'] = param.Value;
                        break;
                    case ReferralChargeFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;

                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteReferralCharge(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<ReferralChargeFilters>): Promise<any> {
        let val = await this.GetReferralCharges(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ReferralChargeInstance, ReferralChargeAttributes> {
        return this.Models.ReferralCharge;
    }
}
