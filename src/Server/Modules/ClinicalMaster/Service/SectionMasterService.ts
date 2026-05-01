import {BaseService, BoFactory } from '../../Base/Index';
import { SectionMasterBo, SectionCategoryMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { SectionMasterAttributes, SectionCategoryMapAttributes } from '../Model/Interface/Index';
import { SectionMasterFilters } from '../Common/Filters.e';

export class SectionMasterService extends BaseService {
    private SectionMasterBo: SectionMasterBo;
    private SectionCategoryMapBo: SectionCategoryMapBo;
    constructor(req?: Request) {
        super(req);
        this.SectionMasterBo = BoFactory.GetBo(SectionMasterBo, this.Request);
        this.SectionCategoryMapBo = BoFactory.GetBo(SectionCategoryMapBo, this.Request);
    }

    public async AddSectionMaster(req: BaseRequest): Promise<number> {
        return await this.SectionMasterBo.AddSectionMaster(req);
    }

    public async UpdateSectionMaster(req: BaseRequest): Promise<boolean> {
        return await this.SectionMasterBo.UpdateSectionMaster(req);
    }

    public async GetSectionMasterById(req: BaseRequest): Promise<SectionMasterAttributes> {
        return await this.SectionMasterBo.GetSectionMasterById(req);
    }

    public async GetSectionMasters(apiReq?: ApiRequest<SectionMasterFilters>): Promise<ApiResponse<SectionMasterAttributes[]>> {
        return await this.SectionMasterBo.GetSectionMasters(apiReq);
    }

    public async DeleteSectionMaster(req: BaseRequest): Promise<Boolean> {
        return await this.SectionMasterBo.DeleteSectionMaster(req);
    }

    public async MapCategories(req: BaseRequest): Promise<Boolean> {
        return await this.SectionCategoryMapBo.ManageSectionCategories(req);
    }

    public async GetCategories(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<SectionCategoryMapAttributes>> {
        return await this.SectionMasterBo.GetCategories(apiReq);
    }
}
