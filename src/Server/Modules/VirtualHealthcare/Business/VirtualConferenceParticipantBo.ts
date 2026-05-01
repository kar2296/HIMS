import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { VirtualConferenceParticipantInstance, VirtualConferenceParticipantAttributes } from '../Model/Interface/Index';
import { VirtualConferenceParticipantFilters } from '../Common/Filters.e';

export class VirtualConferenceParticipantBo extends BaseBo<VirtualConferenceParticipantInstance,
    VirtualConferenceParticipantAttributes> {
    public async AddVirtualConferenceParticipant(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateVirtualConferenceParticipant(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetVirtualConferenceParticipantById(req: BaseRequest): Promise<VirtualConferenceParticipantAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVirtualConferenceParticipants(apiReq?: ApiRequest<VirtualConferenceParticipantFilters>):
        Promise<ApiResponse<VirtualConferenceParticipantAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VirtualConferenceParticipantFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VirtualConferenceParticipantFilters.ConferenceId:
                        where['ConferenceId'] = param.Value;
                        break;
                    case VirtualConferenceParticipantFilters.ParticipantUserId:
                        where['ParticipantUserId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVirtualConferenceParticipant(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VirtualConferenceParticipantInstance, VirtualConferenceParticipantAttributes> {
        return this.Models.VirtualConferenceParticipant;
    }
}
