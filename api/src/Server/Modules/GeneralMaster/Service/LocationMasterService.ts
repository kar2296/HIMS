import { BaseService, BoFactory } from '../../Base/Index';
import { LocationMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest,  ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LocationMasterAttributes } from '../Model/Interface/Index';
import { LocationMasterFilters } from '../Common/Filters.e';

export class LocationMasterService extends BaseService {
    private LocationMasterBo: LocationMasterBo;
    constructor(req?: Request) {
        super(req);
        this.LocationMasterBo = BoFactory.GetBo(LocationMasterBo, this.Request);
    }

    public async AddLocationMaster(req: BaseRequest): Promise<number> {
        return await this.LocationMasterBo.AddLocationMaster(req);
    }

    public async UpdateLocationMaster(req: BaseRequest): Promise<boolean> {
        return await this.LocationMasterBo.UpdateLocationMaster(req);
    }

    public async GetLocationMasterById(req: BaseRequest): Promise<LocationMasterAttributes> {
        return await this.LocationMasterBo.GetLocationMasterById(req);
    }

    public async GetLocationMasters(apiReq?: ApiRequest<LocationMasterFilters>): Promise<ApiResponse<LocationMasterAttributes[]>> {
        return await this.LocationMasterBo.GetLocationMasters(apiReq);
    }

    public async DeleteLocationMaster(req: BaseRequest): Promise<Boolean> {
        return await this.LocationMasterBo.DeleteLocationMaster(req);
    }
}
