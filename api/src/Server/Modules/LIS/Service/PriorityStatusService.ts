import {BaseService, BoFactory } from '../../Base/Index';
import { PriorityStatusBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PriorityStatusAttributes } from '../Model/Interface/Index';

export class PriorityStatusService extends BaseService {
    private PriorityStatusBo: PriorityStatusBo;
    constructor(req?: Request) {
        super(req);
        this.PriorityStatusBo = BoFactory.GetBo(PriorityStatusBo, this.Request);
    }

    public async AddPriorityStatus(req: BaseRequest): Promise<number> {
        return await this.PriorityStatusBo.AddPriorityStatus(req);
    }

    public async UpdatePriorityStatus(req: BaseRequest): Promise<boolean> {
        return await this.PriorityStatusBo.UpdatePriorityStatus(req);
    }

    public async GetPriorityStatusById(req: BaseRequest): Promise<PriorityStatusAttributes> {
        return await this.PriorityStatusBo.GetPriorityStatusById(req);
    }

    public async GetPriorityStatuss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PriorityStatusAttributes[]>> {
        return await this.PriorityStatusBo.GetPriorityStatuss(apiReq);
    }

    public async DeletePriorityStatus(req: BaseRequest): Promise<Boolean> {
        return await this.PriorityStatusBo.DeletePriorityStatus(req);
    }
}
