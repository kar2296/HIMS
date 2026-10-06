import { BaseService, BoFactory } from '../../Base/Index';
import { OrgIsolationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OrgIsolationAttributes } from '../Model/Interface/Index';
import { OrgIsolationFilters } from '../Common/Filters.e';

export class OrgIsolationService extends BaseService {
    private OrgIsolationBo: OrgIsolationBo;
    constructor(req?: Request) {
        super(req);
        this.OrgIsolationBo = BoFactory.GetBo(OrgIsolationBo, this.Request);
    }

    public async AddOrgIsolation(req: BaseRequest): Promise<number> {
        return await this.OrgIsolationBo.AddOrgIsolation(req);
    }

    public async UpdateOrgIsolation(req: BaseRequest): Promise<boolean> {
        return await this.OrgIsolationBo.UpdateOrgIsolation(req);
    }

    public async GetOrgIsolationById(req: BaseRequest): Promise<OrgIsolationAttributes> {
        return await this.OrgIsolationBo.GetOrgIsolationById(req);
    }

    public async GetOrgIsolations(apiReq?: ApiRequest<OrgIsolationFilters>): Promise<ApiResponse<OrgIsolationAttributes[]>> {
        return await this.OrgIsolationBo.GetOrgIsolations(apiReq);
    }

    public async DeleteOrgIsolation(req: BaseRequest): Promise<Boolean> {
        return await this.OrgIsolationBo.DeleteOrgIsolation(req);
    }
}
