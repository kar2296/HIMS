import { BaseService, BoFactory } from '../../Base/Index';
import { CssdGroupItemBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CssdGroupItemAttributes } from '../Model/Interface/Index';
// import { CSSDStoreMapAttributes } from '../Model/Interface/Index';
import { CssdGroupItemFilters } from '../Common/Filters.e';

export class CssdGroupItemService extends BaseService {
    private CssdGroupItemBo: CssdGroupItemBo;
    constructor(req?: Request) {
        super(req);
        this.CssdGroupItemBo = BoFactory.GetBo(CssdGroupItemBo, this.Request);
    }

    public async AddCssdGroupItem(req: BaseRequest): Promise<number> {
        return await this.CssdGroupItemBo.AddCssdGroupItem(req);
    }

    public async UpdateCssdGroupItem(req: BaseRequest): Promise<boolean> {
        return await this.CssdGroupItemBo.UpdateCssdGroupItem(req);
    }

    public async GetCssdGroupItemById(req: BaseRequest): Promise<CssdGroupItemAttributes> {
        return await this.CssdGroupItemBo.GetCssdGroupItemById(req);
    }

    public async GetCssdGroupItems(apiReq?: ApiRequest<CssdGroupItemFilters>): Promise<ApiResponse<CssdGroupItemAttributes[]>> {
        return await this.CssdGroupItemBo.GetCssdGroupItems(apiReq);
    }

    public async DeleteCssdGroupItem(req: BaseRequest): Promise<Boolean> {
        return await this.CssdGroupItemBo.DeleteCssdGroupItem(req);
    }


}
