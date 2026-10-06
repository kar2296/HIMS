import { BaseService, BoFactory } from '../../Base/Index';
import { SuccessStoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { SuccessStoryAttributes } from '../Model/Interface/Index';
import { SuccessStoryFilters } from '../Common/Filters.e';

export class SuccessStoryService extends BaseService {
    private SuccessStoryBo: SuccessStoryBo;
    constructor(req?: Request) {
        super(req);
        this.SuccessStoryBo = BoFactory.GetBo(SuccessStoryBo, this.Request);
    }

    public async AddSuccessStory(req: BaseRequest): Promise<number> {
        return await this.SuccessStoryBo.AddSuccessStory(req);
    }

    public async UpdateSuccessStory(req: BaseRequest): Promise<boolean> {
        return await this.SuccessStoryBo.UpdateSuccessStory(req);
    }

    public async GetSuccessStoryById(req: BaseRequest): Promise<SuccessStoryAttributes> {
        return await this.SuccessStoryBo.GetSuccessStoryById(req);
    }
    public async GetAttachmentFile(req: BaseRequest): Promise<SuccessStoryAttributes> {
        return await this.SuccessStoryBo.GetAttachmentFile(req);
    }
    // public async GetAttachmentFile(apiReq?: ApiRequest<SuccessStoryFilters>): Promise<ApiResponse<SuccessStoryAttributes[]>> {
    //     return await this.SuccessStoryBo.GetAttachmentFile(apiReq);
    // }
    // public async GetAttachmentFile(req: BaseRequest, res: Response): Promise<any> {
    //     return await this.SuccessStoryBo.GetAttachmentFile(req, res);
    // }

    public async GetSuccessStorys(apiReq?: ApiRequest<SuccessStoryFilters>):
        Promise<ApiResponse<SuccessStoryAttributes[]>> {
        return await this.SuccessStoryBo.GetSuccessStorys(apiReq);
    }

    public async DeleteSuccessStory(req: BaseRequest): Promise<Boolean> {
        return await this.SuccessStoryBo.DeleteSuccessStory(req);
    }
}
