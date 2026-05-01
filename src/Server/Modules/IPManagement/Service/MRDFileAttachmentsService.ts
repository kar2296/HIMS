import { BaseService, BoFactory } from '../../Base/Index';
import { MRDFileAttachmentsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { MRDFileAttachmentAttributes } from '../Model/Interface/Index';
import { MRDFileAttachmentFilters } from '../Common/Filters.e';

export class MRDFileAttachmentsService extends BaseService {
    private MRDFileAttachmentsBo: MRDFileAttachmentsBo;
    constructor(req?: Request) {
        super(req);
        this.MRDFileAttachmentsBo = BoFactory.GetBo(MRDFileAttachmentsBo, this.Request);
    }

    public async AddMRDFileAttachment(req: BaseRequest): Promise<number> {
        return await this.MRDFileAttachmentsBo.AddMRDFileAttachment(req);
    }

    public async UpdateMRDFileAttachment(req: BaseRequest): Promise<boolean> {
        return await this.MRDFileAttachmentsBo.UpdateMRDFileAttachment(req);
    }

    public async GetMRDFileAttachmentById(req: BaseRequest): Promise<MRDFileAttachmentAttributes> {
        return await this.MRDFileAttachmentsBo.GetMRDFileAttachmentById(req);
    }

    public async GetMRDFileAttachments(apiReq?: ApiRequest<MRDFileAttachmentFilters>):
    Promise<ApiResponse<MRDFileAttachmentAttributes[]>> {
        return await this.MRDFileAttachmentsBo.GetMRDFileAttachments(apiReq);
    }

    public async DeleteMRDFileAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.MRDFileAttachmentsBo.DeleteMRDFileAttachment(req);
    }
}
