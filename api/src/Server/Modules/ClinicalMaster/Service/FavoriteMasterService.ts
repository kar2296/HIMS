import {BaseService, BoFactory } from '../../Base/Index';
import { FavoriteMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FavoriteMasterAttributes } from '../Model/Interface/Index';
import { FavoriteMasterFilters } from '../Common/Filters.e';

export class FavoriteMasterService extends BaseService {
    private FavoriteMasterBo: FavoriteMasterBo;
    constructor(req?: Request) {
        super(req);
        this.FavoriteMasterBo = BoFactory.GetBo(FavoriteMasterBo, this.Request);
    }

    public async AddFavoriteMaster(req: BaseRequest): Promise<number> {
        return await this.FavoriteMasterBo.AddFavoriteMaster(req);
    }

    public async UpdateFavoriteMaster(req: BaseRequest): Promise<boolean> {
        return await this.FavoriteMasterBo.UpdateFavoriteMaster(req);
    }

    public async GetFavoriteMasterById(req: BaseRequest): Promise<FavoriteMasterAttributes> {
        return await this.FavoriteMasterBo.GetFavoriteMasterById(req);
    }

    public async GetFavoriteMasters(apiReq?: ApiRequest<FavoriteMasterFilters>): Promise<ApiResponse<FavoriteMasterAttributes[]>> {
        return await this.FavoriteMasterBo.GetFavoriteMasters(apiReq);
    }

    public async DeleteFavoriteMaster(req: BaseRequest): Promise<Boolean> {
        return await this.FavoriteMasterBo.DeleteFavoriteMaster(req);
    }
}
