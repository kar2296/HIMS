import {BaseService, BoFactory} from '../../Base/Index';
import { ProcedureAliasBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ProcedureAliasAttributes} from '../Model/Interface/Index';
import { ProcedureAliasFilters } from '../Common/Filters.e';

export class ProcedureAliasService extends BaseService {
    private ProcedureAliasBo: ProcedureAliasBo;
    constructor(req?: Request) {
        super(req);
        this.ProcedureAliasBo = BoFactory.GetBo(ProcedureAliasBo, this.Request);
    }

    public async AddProcedureAlias(req: BaseRequest): Promise<number> {
        return await this.ProcedureAliasBo.AddProcedureAlias(req);
    }

    public async UpdateProcedureAlias(req: BaseRequest): Promise<boolean> {
        return await this.ProcedureAliasBo.UpdateProcedureAlias(req);
    }

    public async GetProcedureAliasById(req: BaseRequest): Promise<ProcedureAliasAttributes> {
        return await this.ProcedureAliasBo.GetProcedureAliasById(req);
    }

    public async GetProcedureAliass(apiReq?: ApiRequest<ProcedureAliasFilters>): Promise<Array<ProcedureAliasAttributes>> {
        return await this.ProcedureAliasBo.GetProcedureAliass(apiReq);
    }

    public async DeleteProcedureAlias(req: BaseRequest): Promise<Boolean> {
        return await this.ProcedureAliasBo.DeleteProcedureAlias(req);
    }
}
