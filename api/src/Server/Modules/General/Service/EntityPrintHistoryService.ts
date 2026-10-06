import { BaseService, BoFactory } from '../../Base/Index';
import { EntityPrintHistoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EntityPrintHistoryAttributes } from '../Model/Interface/Index';
import { EntityPrintHistoryFilters } from '../Common/Filters.e';

export class EntityPrintHistoryService extends BaseService {
    private EntityPrintHistoryBo: EntityPrintHistoryBo;
    constructor(req?: Request) {
        super(req);
        this.EntityPrintHistoryBo = BoFactory.GetBo(EntityPrintHistoryBo, this.Request);
    }

    public async AddEntityPrintHistory(req: BaseRequest): Promise<number> {
        return await this.EntityPrintHistoryBo.AddEntityPrintHistory(req);
    }

    public async UpdateEntityPrintHistory(req: BaseRequest): Promise<boolean> {
        return await this.EntityPrintHistoryBo.UpdateEntityPrintHistory(req);
    }

    public async GetEntityPrintHistoryById(req: BaseRequest): Promise<EntityPrintHistoryAttributes> {
        return await this.EntityPrintHistoryBo.GetEntityPrintHistoryById(req);
    }

    public async GetEntityPrintHistorys(apiReq?: ApiRequest<EntityPrintHistoryFilters>):
        Promise<ApiResponse<EntityPrintHistoryAttributes[]>> {
        return await this.EntityPrintHistoryBo.GetEntityPrintHistorys(apiReq);
    }

    public async DeleteEntityPrintHistory(req: BaseRequest): Promise<Boolean> {
        return await this.EntityPrintHistoryBo.DeleteEntityPrintHistory(req);
    }
}
