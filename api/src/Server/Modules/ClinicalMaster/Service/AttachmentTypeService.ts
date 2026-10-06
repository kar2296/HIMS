import {BaseService, BoFactory} from '../../Base/Index';
import { AttachmentTypeBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { AttachmentTypeAttributes} from '../Model/Interface/Index';
import { AttachmentTypeFilters } from '../Common/Filters.e';

export class AttachmentTypeService extends BaseService {
    private AttachmentTypeBo: AttachmentTypeBo;
    constructor(req?: Request) {
        super(req);
        this.AttachmentTypeBo = BoFactory.GetBo(AttachmentTypeBo, this.Request);
    }

    public async AddAttachmentType(req: BaseRequest): Promise<number> {
        return await this.AttachmentTypeBo.AddAttachmentType(req);
    }

    public async UpdateAttachmentType(req: BaseRequest): Promise<boolean> {
        return await this.AttachmentTypeBo.UpdateAttachmentType(req);
    }

    public async GetAttachmentTypeById(req: BaseRequest): Promise<AttachmentTypeAttributes> {
        return await this.AttachmentTypeBo.GetAttachmentTypeById(req);
    }

    public async GetAttachmentTypes(apiReq?: ApiRequest<AttachmentTypeFilters>): Promise<ApiResponse<AttachmentTypeAttributes[]>> {
        return await this.AttachmentTypeBo.GetAttachmentTypes(apiReq);
    }

    public async DeleteAttachmentType(req: BaseRequest): Promise<Boolean> {
        return await this.AttachmentTypeBo.DeleteAttachmentType(req);
    }
}
