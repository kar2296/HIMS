import { BaseService, BoFactory } from '../../Base/Index';
import { BannerContentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BannerContentAttributes } from '../Model/Interface/Index';
import { BannerContentFilters } from '../Common/Filters.e';

export class BannerContentService extends BaseService {
    private BannerContentBo: BannerContentBo;
    constructor(req?: Request) {
        super(req);
        this.BannerContentBo = BoFactory.GetBo(BannerContentBo, this.Request);
    }

    public async AddBannerContent(req: BaseRequest): Promise<number> {
        return await this.BannerContentBo.AddBannerContent(req);
    }

    public async UpdateBannerContent(req: BaseRequest): Promise<boolean> {
        return await this.BannerContentBo.UpdateBannerContent(req);
    }

    public async GetBannerContentById(req: BaseRequest): Promise<BannerContentAttributes> {
        return await this.BannerContentBo.GetBannerContentById(req);
    }

    public async GetAttachmentFile(apiReq?: ApiRequest<BannerContentFilters>): Promise<ApiResponse<BannerContentAttributes[]>> {
        return await this.BannerContentBo.GetAttachmentFile(apiReq);
    }
    // public async GetAttachmentFile(req: BaseRequest, res: Response): Promise<any> {
    //     return await this.BannerContentBo.GetAttachmentFile(req, res);
    // }

    public async GetBannerContents(apiReq?: ApiRequest<BannerContentFilters>):
        Promise<ApiResponse<BannerContentAttributes[]>> {
        return await this.BannerContentBo.GetBannerContents(apiReq);
    }

    public async DeleteBannerContent(req: BaseRequest): Promise<Boolean> {
        return await this.BannerContentBo.DeleteBannerContent(req);
    }
}
