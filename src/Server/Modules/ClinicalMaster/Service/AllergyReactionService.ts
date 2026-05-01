import {BaseService, BoFactory} from '../../Base/Index';
import { AllergyReactionBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { AllergyReactionAttributes} from '../Model/Interface/Index';
import { AllergyReactionFilters } from '../Common/Filters.e';

export class AllergyReactionService extends BaseService {
    private AllergyReactionBo: AllergyReactionBo;
    constructor(req?: Request) {
        super(req);
        this.AllergyReactionBo = BoFactory.GetBo(AllergyReactionBo, this.Request);
    }

    public async AddAllergyReaction(req: BaseRequest): Promise<number> {
        return await this.AllergyReactionBo.AddAllergyReaction(req);
    }

    public async UpdateAllergyReaction(req: BaseRequest): Promise<boolean> {
        return await this.AllergyReactionBo.UpdateAllergyReaction(req);
    }

    public async GetAllergyReactionById(req: BaseRequest): Promise<AllergyReactionAttributes> {
        return await this.AllergyReactionBo.GetAllergyReactionById(req);
    }

    public async GetAllergyReactions(apiReq?: ApiRequest<AllergyReactionFilters>): Promise<ApiResponse<AllergyReactionAttributes[]>> {
        return await this.AllergyReactionBo.GetAllergyReactions(apiReq);
    }

    public async DeleteAllergyReaction(req: BaseRequest): Promise<Boolean> {
        return await this.AllergyReactionBo.DeleteAllergyReaction(req);
    }
}
