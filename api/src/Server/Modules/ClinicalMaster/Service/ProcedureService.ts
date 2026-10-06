import {BaseService, BoFactory} from '../../Base/Index';
import { ProcedureBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ProcedureAttributes} from '../Model/Interface/Index';
import { ProcedureFilters } from '../Common/Filters.e';

export class ProcedureService extends BaseService {
    private ProcedureBo: ProcedureBo;
    constructor(req?: Request) {
        super(req);
        this.ProcedureBo = BoFactory.GetBo(ProcedureBo, this.Request);
    }

    public async AddProcedure(req: BaseRequest): Promise<number> {
        return await this.ProcedureBo.AddProcedure(req);
    }

    public async UpdateProcedure(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureBo.UpdateProcedure(req);
    }

    public async GetProcedureById(req: BaseRequest): Promise<ProcedureAttributes> {
        return await this.ProcedureBo.GetProcedureById(req);
    }

    public async GetProcedures(apiReq?: ApiRequest<ProcedureFilters>): Promise<ApiResponse<ProcedureAttributes[]>> {
        return await this.ProcedureBo.GetProcedures(apiReq);
    }

    public async DeleteProcedure(req: BaseRequest): Promise<Boolean> {
        return await this.ProcedureBo.DeleteProcedure(req);
    }
}
