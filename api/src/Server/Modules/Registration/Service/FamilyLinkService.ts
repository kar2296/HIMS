import { BaseService, BoFactory } from '../../Base/Index';
import { FamilyLinkBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FamilyLinkAttributes } from '../Model/Interface/Index';
import { FamilyLinkFilters } from '../Common/Filters.e';

export class FamilyLinkService extends BaseService {
    private FamilyLinkBo: FamilyLinkBo;
    constructor(req?: Request) {
        super(req);
        this.FamilyLinkBo = BoFactory.GetBo(FamilyLinkBo, this.Request);
    }

    public async AddFamilyLink(req: BaseRequest): Promise<number> {
        return await this.FamilyLinkBo.AddFamilyLink(req);
    }

    public async UpdateFamilyLink(req: BaseRequest): Promise<boolean> {
        return await this.FamilyLinkBo.UpdateFamilyLink(req);
    }

    public async ManageFamilyLinks(req: BaseRequest): Promise<boolean> {
        return await this.FamilyLinkBo.ManageFamilyLinks(req);
    }

    public async GetFamilyLinkById(req: BaseRequest): Promise<FamilyLinkAttributes> {
        return await this.FamilyLinkBo.GetFamilyLinkById(req);
    }

    public async GetFamilyLinks(apiReq?: ApiRequest<FamilyLinkFilters>): Promise<Array<FamilyLinkAttributes>> {
        return await this.FamilyLinkBo.GetFamilyLinks(apiReq);
    }

    public async GetFamilyLinksForBillTransfer(apiReq?: ApiRequest<FamilyLinkFilters>): Promise<ApiResponse<FamilyLinkAttributes[]>> {
        return await this.FamilyLinkBo.GetFamilyLinksForBillTransfer(apiReq);
    }

    public async DeleteFamilyLink(req: BaseRequest): Promise<Boolean> {
        return await this.FamilyLinkBo.DeleteFamilyLink(req);
    }
}
