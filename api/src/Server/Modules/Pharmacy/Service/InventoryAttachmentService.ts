import { BaseService, BoFactory } from '../../Base/Index';
import { InventoryAttachmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, Response } from '../../../Core/Index';
import { InventoryAttachmentAttributes } from '../Model/Interface/Index';
import { InventoryAttachmentFilters } from '../Common/Filters.e';

export class InventoryAttachmentService extends BaseService {
    private InventoryAttachmentBo: InventoryAttachmentBo;
    constructor(req?: Request) {
        super(req);
        this.InventoryAttachmentBo = BoFactory.GetBo(InventoryAttachmentBo, this.Request);
    }
    public async AddInventoryAttachment(req: BaseRequest): Promise<number> {
        return await this.InventoryAttachmentBo.AddInventoryAttachment(req);
    }

    public async UpdateInventoryAttachment(req: BaseRequest): Promise<boolean> {
        return await this.InventoryAttachmentBo.UpdateInventoryAttachment(req);
    }

    public async GetAttachmentFile(req: BaseRequest, res: Response): Promise<any> {
        return await this.InventoryAttachmentBo.GetAttachmentFile(req, res);
    }

    public async GetInventoryAttachmentById(req: BaseRequest): Promise<InventoryAttachmentAttributes> {
        return await this.InventoryAttachmentBo.GetInventoryAttachmentById(req);
    }

    public async GetInventoryAttachments(apiReq?: ApiRequest<InventoryAttachmentFilters>):
        Promise<ApiResponse<InventoryAttachmentAttributes[]>> {
        return await this.InventoryAttachmentBo.GetInventoryAttachments(apiReq);
    }

    public async DeleteInventoryAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.InventoryAttachmentBo.DeleteInventoryAttachment(req);
    }
}
