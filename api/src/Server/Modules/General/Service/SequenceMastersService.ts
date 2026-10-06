import {BaseService, BoFactory } from '../../Base/Index';
import {SequenceMastersBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { SequenceMastersAttributes } from '../Model/Interface/Index';
import { SequenceMastersFilters } from '../Common/Filters.e';

export class SequenceMastersService extends BaseService {
    private SequenceMastersBo:SequenceMastersBo;
    constructor(req?: Request) {
        super(req);
        this.SequenceMastersBo = BoFactory.GetBo(SequenceMastersBo, this.Request);
    }

    public async AddSequenceMasters(req: BaseRequest): Promise<number> {
        return await this.SequenceMastersBo.AddSequenceMasters(req);
    }

    public async UpdateSequenceMasters(req: BaseRequest): Promise<boolean> {
        return await this.SequenceMastersBo.UpdateSequenceMasters(req);
    }

    public async GetSequenceMastersById(req: BaseRequest): Promise<SequenceMastersAttributes> {
        return await this.SequenceMastersBo.GetSequenceMastersById(req);
    }

    public async GetSequenceMasterss(apiReq?: ApiRequest<SequenceMastersFilters>): Promise<ApiResponse<SequenceMastersAttributes[]>> {
        return await this.SequenceMastersBo.GetSequenceMasterss(apiReq);
    }

    public async DeleteSequenceMasters(req: BaseRequest): Promise<Boolean> {
        return await this.SequenceMastersBo.DeleteSequenceMasters(req);
    }

    public async SyncRedisToSqlSequenceMasters(apiReq?: ApiRequest<SequenceMastersFilters>): Promise<boolean> {
        return await this.SequenceMastersBo.SyncRedisToSqlSequenceMasters(apiReq);
    }

    public async SyncSqlToRedisSequenceMasters(apiReq?: ApiRequest<SequenceMastersFilters>): Promise<boolean> {
        return await this.SequenceMastersBo.SyncSqlToRedisSequenceMasters(apiReq);
    }
}
