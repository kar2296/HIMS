import { BaseService, BoFactory } from '../../Base/Index';
import { FacilityBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FacilityAttributes, FacilityDepartmentMapAttributes } from '../Model/Interface/Index';
import { FacilityFilters } from '../Common/Filters.e';

export class FacilityService extends BaseService {
    private FacilityBo: FacilityBo;
    constructor(req?: Request) {
        super(req);
        this.FacilityBo = BoFactory.GetBo(FacilityBo, this.Request);
    }

    public async AddFacility(req: BaseRequest): Promise<number> {
        return await this.FacilityBo.AddFacility(req);
    }

    public async UpdateFacility(req: BaseRequest): Promise<boolean> {
        return await this.FacilityBo.UpdateFacility(req);
    }

    public async GetFacilityById(req: BaseRequest): Promise<FacilityAttributes> {
        return await this.FacilityBo.GetFacilityById(req);
    }

    public async GetMinFacilityById(req: BaseRequest): Promise<FacilityAttributes> {
        return await this.FacilityBo.GetMinFacilityById(req);
    }
    public async GetFacilitys(apiReq?: ApiRequest<FacilityFilters>): Promise<ApiResponse<FacilityAttributes[]>> {
        return await this.FacilityBo.GetFacilitys(apiReq);
    }

    public async GetOtherFacilitys(apiReq?: ApiRequest<FacilityFilters>): Promise<ApiResponse<FacilityAttributes[]>> {
        return await this.FacilityBo.GetOtherFacilitys(apiReq);
    }

    public async GetFacilityLogo(apiReq?: ApiRequest<FacilityFilters>): Promise<ApiResponse<FacilityAttributes[]>> {
        return await this.FacilityBo.GetFacilityLogo(apiReq);
    }
    public async GetSecondFacilityLogo(apiReq?: ApiRequest<FacilityFilters>): Promise<ApiResponse<FacilityAttributes[]>> {
        return await this.FacilityBo.GetSecondFacilityLogo(apiReq);
    }
    public async DeleteFacility(req: BaseRequest): Promise<Boolean> {
        return await this.FacilityBo.DeleteFacility(req);
    }

    public async MapDepartments(req: BaseRequest): Promise<Boolean> {
        return await this.FacilityBo.MapDeparments(req);
    }

    public async GetDepartments(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<FacilityDepartmentMapAttributes>> {
        const result = await this.FacilityBo.GetDeparments(apiReq);
        return result as Array<FacilityDepartmentMapAttributes>;
    }

}
