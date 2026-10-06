import { BaseService, BoFactory } from '../../Base/Index';
import { AdverseDrugReactionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { AdverseDrugReactionAttributes } from '../Model/Interface/Index';
import { AdverseDrugReactionFilters } from '../Common/Filters.e';

export class AdverseDrugReactionService extends BaseService {
    private AdverseDrugReactionBo: AdverseDrugReactionBo;
    constructor(req?: Request) {
        super(req);
        this.AdverseDrugReactionBo = BoFactory.GetBo(AdverseDrugReactionBo, this.Request);
    }

    public async AddAdverseDrugReaction(req: BaseRequest): Promise<number> {
        return await this.AdverseDrugReactionBo.AddAdverseDrugReaction(req);
    }

    public async UpdateAdverseDrugReaction(req: BaseRequest): Promise<boolean> {
        return await this.AdverseDrugReactionBo.UpdateAdverseDrugReaction(req);
    }

    public async UploadAttachment(req: BaseRequest): Promise<boolean> {
        return await this.AdverseDrugReactionBo.UploadAttachment(req);
    }

    public async GetViewAttachment1(apiReq?: ApiRequest<AdverseDrugReactionFilters>):
        Promise<ApiResponse<AdverseDrugReactionAttributes[]>> {
        return await this.AdverseDrugReactionBo.GetViewAttachment1(apiReq);
    }

    public async GetViewAttachment2(apiReq?: ApiRequest<AdverseDrugReactionFilters>):
        Promise<ApiResponse<AdverseDrugReactionAttributes[]>> {
        return await this.AdverseDrugReactionBo.GetViewAttachment2(apiReq);
    }


    public async GetAdverseDrugReactionById(req: BaseRequest): Promise<AdverseDrugReactionAttributes> {
        return await this.AdverseDrugReactionBo.GetAdverseDrugReactionById(req);
    }

    public async GetAdverseDrugReactions(apiReq?: ApiRequest<AdverseDrugReactionFilters>):
        Promise<ApiResponse<AdverseDrugReactionAttributes[]>> {
        return await this.AdverseDrugReactionBo.GetAdverseDrugReactions(apiReq);
    }

    public async PrintAdverseDrugReaction(req: BaseRequest): Promise<FileInfo> {
        return await this.AdverseDrugReactionBo.PrintAdverseDrugReaction(req);
    }

    public async DeleteAdverseDrugReaction(req: BaseRequest): Promise<Boolean> {
        return await this.AdverseDrugReactionBo.DeleteAdverseDrugReaction(req);
    }
}
