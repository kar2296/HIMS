import { BaseService, BoFactory } from '../../Base/Index';
import { MessageBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { MessageAttributes } from '../Model/Interface/Index';
import { MessageFilters } from '../Common/Filters.e';

export class MessageService extends BaseService {
    private MessageBo: MessageBo;
    constructor(req?: Request) {
        super(req);
        this.MessageBo = BoFactory.GetBo(MessageBo, this.Request);
    }

    public async AddMessage(req: BaseRequest): Promise<number> {
        return await this.MessageBo.AddMessage(req);
    }

    public async UpdateMessage(req: BaseRequest): Promise<boolean> {
        return await this.MessageBo.UpdateMessage(req);
    }

    public async GetMessageById(req: BaseRequest): Promise<MessageAttributes> {
        return await this.MessageBo.GetMessageById(req);
    }

    public async GetMessages(apiReq?: ApiRequest<MessageFilters>): Promise<ApiResponse<MessageAttributes[]>> {
        return await this.MessageBo.GetMessages(apiReq);
    }

    public async DeleteMessage(req: BaseRequest): Promise<Boolean> {
        return await this.MessageBo.DeleteMessage(req);
    }
}
