import {BaseService, BoFactory } from '../../Base/Index';
import { FavoriteMasterDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FavoriteMasterDetailAttributes } from '../Model/Interface/Index';
import { FavoriteMasterDetailFilters } from '../Common/Filters.e';

export class FavoriteMasterDetailService extends BaseService {
    private FavoriteMasterDetailBo: FavoriteMasterDetailBo;
    constructor(req?: Request) {
        super(req);
        this.FavoriteMasterDetailBo = BoFactory.GetBo(FavoriteMasterDetailBo, this.Request);
    }

    public async AddFavoriteMasterDetail(req: BaseRequest): Promise<number> {
        return await this.FavoriteMasterDetailBo.AddFavoriteMasterDetail(req);
    }

    public async UpdateFavoriteMasterDetail(req: BaseRequest): Promise<boolean> {
        return await this.FavoriteMasterDetailBo.UpdateFavoriteMasterDetail(req);
    }

    public async GetFavoriteMasterDetailById(req: BaseRequest): Promise<FavoriteMasterDetailAttributes> {
        return await this.FavoriteMasterDetailBo.GetFavoriteMasterDetailById(req);
    }

    public async GetFavoriteMasterDetails(apiReq?: ApiRequest<FavoriteMasterDetailFilters>):
     Promise<ApiResponse<FavoriteMasterDetailAttributes[]>> {
        return await this.FavoriteMasterDetailBo.GetFavoriteMasterDetails(apiReq);
    }

    public async DeleteFavoriteMasterDetail(req: BaseRequest): Promise<Boolean> {
        return await this.FavoriteMasterDetailBo.DeleteFavoriteMasterDetail(req);
    }
}
