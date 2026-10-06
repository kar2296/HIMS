import {BaseService, BoFactory } from '../../Base/Index';
import { CityMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CityMasterAttributes } from '../Model/Interface/Index';
import { CityMasterFilters } from '../Common/Filters.e';

export class CityMasterService extends BaseService {
    private CityMasterBo: CityMasterBo;
    constructor(req?: Request) {
        super(req);
        this.CityMasterBo = BoFactory.GetBo(CityMasterBo, this.Request);
    }

    public async AddCityMaster(req: BaseRequest): Promise<number> {
        return await this.CityMasterBo.AddCityMaster(req);
    }

    public async UpdateCityMaster(req: BaseRequest): Promise<boolean> {
        return await this.CityMasterBo.UpdateCityMaster(req);
    }

    public async GetCityMasterById(req: BaseRequest): Promise<CityMasterAttributes> {
        return await this.CityMasterBo.GetCityMasterById(req);
    }

    public async GetCityMasters(apiReq?: ApiRequest<CityMasterFilters>): Promise<ApiResponse<CityMasterAttributes[]>> {
        return await this.CityMasterBo.GetCityMasters(apiReq);
    }

    public async DeleteCityMaster(req: BaseRequest): Promise<Boolean> {
        return await this.CityMasterBo.DeleteCityMaster(req);
    }
}
