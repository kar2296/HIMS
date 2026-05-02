import { BaseService, BoFactory } from '../../Base/Index';
import { DivisionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DivisionAttributes } from '../Model/Interface/Index';
import { DivisionFilters } from '../Common/Filters.e';

export class DivisionService extends BaseService {
    private DivisionBo: DivisionBo;
    constructor(req?: Request) {
        super(req);
        this.DivisionBo = BoFactory.GetBo(DivisionBo, this.Request);
    }

    public async AddDivision(req: BaseRequest): Promise<number> {
        return await this.DivisionBo.AddDivision(req);
    }

    public async UpdateDivision(req: BaseRequest): Promise<boolean> {
        return await this.DivisionBo.UpdateDivision(req);
    }

    public async GetDivisionById(req: BaseRequest): Promise<DivisionAttributes> {
        return await this.DivisionBo.GetDivisionById(req);
    }

    public async GetDivisions(apiReq?: ApiRequest<DivisionFilters>): Promise<ApiResponse<DivisionAttributes[]>> {
        return await this.DivisionBo.GetDivisions(apiReq);
    }

    public async DeleteDivision(req: BaseRequest): Promise<Boolean> {
        return await this.DivisionBo.DeleteDivision(req);
    }
}
