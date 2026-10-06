import { BaseService, BoFactory } from '../../Base/Index';
// Direct import until Business Index is fixed
import { UserCategoryMapBo } from '../Business/UserCategoryMapBo';
import { ApiRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
// Use any type temporarily until interface is properly exported
import { UserCategoryMapFilters } from '../Common/Filters.e';

export class UserCategoryMapService extends BaseService {
    private UserCategoryMapBo: UserCategoryMapBo;
    constructor(req?: Request) {
        super(req);
        this.UserCategoryMapBo = BoFactory.GetBo(UserCategoryMapBo, this.Request);
    }

    public async GetUserCategoryMaps(apiReq?: ApiRequest<UserCategoryMapFilters>): Promise<Array<any>> {
        // Changed return type to Array<any> temporarily
        return await this.UserCategoryMapBo.GetUserCategoryMaps(apiReq);
    }
}
