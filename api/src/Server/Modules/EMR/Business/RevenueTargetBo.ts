import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { RevenueTargetInstance, RevenueTargetAttributes } from '../Model/Interface/Index';
import { RevenueTargetFilters } from '../Common/Filters.e';

export class RevenueTargetBo extends BaseBo<RevenueTargetInstance, RevenueTargetAttributes>  {
    public async AddRevenueTarget(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRevenueTarget(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRevenueTargetById(req: BaseRequest): Promise<RevenueTargetAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRevenueTargets(apiReq?: ApiRequest<RevenueTargetFilters>):
        Promise<ApiResponse<RevenueTargetAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Month'));
        include.push(this.GetReference('FinancialYear'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RevenueTargetFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RevenueTargetFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteRevenueTarget(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RevenueTargetInstance, RevenueTargetAttributes> {
        return this.Models.RevenueTarget;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<RevenueTargetFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ModalityName', 'Text'], 'ModalityName'];
        let val = await this.GetRevenueTargets(apiReq);
        return { [key]: val.Data };
    }
}
