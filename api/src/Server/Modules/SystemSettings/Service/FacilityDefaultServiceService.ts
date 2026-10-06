import {BaseService, BoFactory } from '../../Base/Index';
import { FacilityDefaultServiceBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FacilityDefaultServiceAttributes } from '../Model/Interface/Index';
import { FacilityDefaultServiceFilters } from '../Common/Filters.e';

export class FacilityDefaultServiceService extends BaseService {
    private FacilityDefaultServiceBo: FacilityDefaultServiceBo;
    constructor(req?: Request) {
        super(req);
        this.FacilityDefaultServiceBo = BoFactory.GetBo(FacilityDefaultServiceBo, this.Request);
    }

    public async AddFacilityDefaultService(req: BaseRequest): Promise<number> {
        return await this.FacilityDefaultServiceBo.AddFacilityDefaultService(req);
    }

    public async UpdateFacilityDefaultService(req: BaseRequest): Promise<boolean> {
        return await this.FacilityDefaultServiceBo.UpdateFacilityDefaultService(req);
    }

    public async ManageFacilityDefaultService(req: BaseRequest): Promise<boolean> {
        return await this.FacilityDefaultServiceBo.ManageFacilityDefaultService(req);
    }

    public async GetFacilityDefaultServiceById(req: BaseRequest): Promise<FacilityDefaultServiceAttributes> {
        return await this.FacilityDefaultServiceBo.GetFacilityDefaultServiceById(req);
    }

    public async GetFacilityDefaultServices(apiReq?: ApiRequest<FacilityDefaultServiceFilters>):
        Promise<ApiResponse<FacilityDefaultServiceAttributes[]>> {
        return await this.FacilityDefaultServiceBo.GetFacilityDefaultServices(apiReq);
    }

    public async DeleteFacilityDefaultService(req: BaseRequest): Promise<Boolean> {
        return await this.FacilityDefaultServiceBo.DeleteFacilityDefaultService(req);
    }
}
