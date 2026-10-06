import {BaseService, BoFactory} from '../../Base/Index';
import { CardMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { CardMasterAttributes} from '../Model/Interface/Index';
import { CardMasterFilters } from '../Common/Filters.e';

export class CardMasterService extends BaseService {
    private CardMasterBo: CardMasterBo;
    constructor(req?: Request) {
        super(req);
        this.CardMasterBo = BoFactory.GetBo(CardMasterBo, this.Request);
    }

    public async AddCardMaster(req: BaseRequest): Promise<number> {
        return await this.CardMasterBo.AddCardMaster(req);
    }

    public async UpdateCardMaster(req: BaseRequest): Promise<boolean> {
        return await this.CardMasterBo.UpdateCardMaster(req);
    }

    public async GetCardMasterById(req: BaseRequest): Promise<CardMasterAttributes> {
        return await this.CardMasterBo.GetCardMasterById(req);
    }

    public async GetCardMasters(apiReq?: ApiRequest<CardMasterFilters>): Promise<ApiResponse<CardMasterAttributes[]>> {
        return await this.CardMasterBo.GetCardMasters(apiReq);
    }

    public async DeleteCardMaster(req: BaseRequest): Promise<Boolean> {
        return await this.CardMasterBo.DeleteCardMaster(req);
    }
}
