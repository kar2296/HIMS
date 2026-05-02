import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualConferenceSessionInstance, VirtualConferenceSessionAttributes } from '../Model/Interface/Index';
import { VirtualConferenceSessionFilters } from '../Common/Filters.e';

export class VirtualConferenceSessionBo extends BaseBo<VirtualConferenceSessionInstance,
    VirtualConferenceSessionAttributes> {
    public async AddVirtualConferenceSession(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualConferenceSession(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVirtualConferenceSessionById(req: BaseRequest): Promise<VirtualConferenceSessionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualConferenceSessions(apiReq?: ApiRequest<VirtualConferenceSessionFilters>):
        Promise<ApiResponse<VirtualConferenceSessionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualConferenceSessionFilters.Id:
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

    public async DeleteVirtualConferenceSession(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualConferenceSessionInstance, VirtualConferenceSessionAttributes> {
        return this.Models.VirtualConferenceSession;
    }
}
