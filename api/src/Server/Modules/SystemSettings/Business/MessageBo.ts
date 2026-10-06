import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { MessageInstance, MessageAttributes } from '../Model/Interface/Index';
import { MessageFilters } from '../Common/Filters.e';

export class MessageBo extends BaseBo<MessageInstance, MessageAttributes> {
    public async AddMessage(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateMessage(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMessageById(req: BaseRequest): Promise<MessageAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('MessageStatus'));
        include.push(this.GetReference('MessageType'));
        include.push(this.GetReference('PRIORITY'));
        include.push({
            model: this.Models.Facility, attributes: ['FacilityName'], required: false,
        });
        include.push({
            model: this.Models.User, as: 'FromUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ToUser', required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetMessages(apiReq?: ApiRequest<MessageFilters>): Promise<ApiResponse<MessageAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('MessageStatus'));
        include.push(this.GetReference('MessageType'));
        include.push(this.GetReference('PRIORITY'));
        include.push({
            model: this.Models.Facility, attributes: ['FacilityName'], required: false,
        });
        include.push({
            model: this.Models.User, as: 'FromUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ToUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient, required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case MessageFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case MessageFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case MessageFilters.MessageStatusId:
                        where['MessageStatusId'] = param.Value;
                        break;
                    case MessageFilters.FromUserId:
                        where['FromUserId'] = param.Value;
                        break;
                    case MessageFilters.ToUserId:
                        where['ToUserId'] = param.Value;
                        break;
                    case MessageFilters.UserTypeId:
                        where['UserTypeId'] = param.Value;
                        break;
                    case MessageFilters.ToFacilityId:
                        where['ToFacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteMessage(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<MessageInstance, MessageAttributes> {
        return this.Models.Message;
    }

}
