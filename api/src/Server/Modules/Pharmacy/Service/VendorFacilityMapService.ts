import { BaseService, BoFactory } from '../../Base/Index';
import { VendorFacilityMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { VendorFacilityMapAttributes } from '../Model/Interface/Index';
import { VendorFacilityFilters } from '../Common/Filters.e';

export class VendorFacilityMapService extends BaseService {
    private VendorFacilityMapBo: VendorFacilityMapBo;
    constructor(req?: Request) {
        super(req);
        this.VendorFacilityMapBo = BoFactory.GetBo(VendorFacilityMapBo, this.Request);
    }

    public async AddVendorFacilityMap(req: BaseRequest): Promise<number> {
        return await this.VendorFacilityMapBo.AddVendorFacilityMap(req);
    }

    public async UpdateVendorFacilityMap(req: BaseRequest): Promise<boolean> {
        return await this.VendorFacilityMapBo.UpdateVendorFacilityMap(req);
    }

    public async GetVendorFacilityMapById(req: BaseRequest): Promise<VendorFacilityMapAttributes> {
        return await this.VendorFacilityMapBo.GetVendorFacilityMapById(req);
    }

    public async GetVendorFacilityMaps(apiReq?: ApiRequest<VendorFacilityFilters>): Promise<ApiResponse<VendorFacilityMapAttributes[]>> {
        return await this.VendorFacilityMapBo.GetVendorFacilityMaps(apiReq);
    }

    public async GetFacilityMasterVendor(apiReq?: ApiRequest<VendorFacilityFilters>): Promise<ApiResponse<VendorFacilityMapAttributes[]>> {
        return await this.VendorFacilityMapBo.GetFacilityMasterVendor(apiReq);
    }

    public async DeleteVendorFacilityMap(req: BaseRequest): Promise<Boolean> {
        return await this.VendorFacilityMapBo.DeleteVendorFacilityMap(req);
    }
}
