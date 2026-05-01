import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualConferenceSessionUserInstance, VirtualConferenceSessionUserAttributes } from '../Model/Interface/Index';
import { VirtualConferenceSessionUserFilters } from '../Common/Filters.e';

export class VirtualConferenceSessionUserBo extends BaseBo<VirtualConferenceSessionUserInstance,
    VirtualConferenceSessionUserAttributes> {
    public async AddVirtualConferenceSessionUser(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualConferenceSessionUser(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVirtualConferenceSessionUserById(req: BaseRequest): Promise<VirtualConferenceSessionUserAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualConferenceSessionUsers(apiReq?: ApiRequest<VirtualConferenceSessionUserFilters>):
        Promise<ApiResponse<VirtualConferenceSessionUserAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualConferenceSessionUserFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualConferenceSessionUser(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualConferenceSessionUserInstance, VirtualConferenceSessionUserAttributes> {
        return this.Models.VirtualConferenceSessionUser;
    }
}
