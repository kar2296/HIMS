import { BaseService, BoFactory } from '../../Base/Index';
import { UserFacilityMapBo } from '../Business/Index';
import { ApiRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { UserFacilityMapAttributes } from '../Model/Interface/Index';
import { UserFacilityMapFilters } from '../Common/Filters.e';

export class UserFacilityMapService extends BaseService {
    private UserFacilityMapBo: UserFacilityMapBo;
    constructor(req?: Request) {
        super(req);
        this.UserFacilityMapBo = BoFactory.GetBo(UserFacilityMapBo, this.Request);
    }

    public async GetUserFacilityMaps(apiReq?: ApiRequest<UserFacilityMapFilters>): Promise<ApiResponse<UserFacilityMapAttributes[]>> {
        try {
            const result = await this.UserFacilityMapBo.GetUserFacilityMaps(apiReq);
            return {
                data: result,
                success: true,
                message: 'User facility maps retrieved successfully',
                statusCode: 200
            } as ApiResponse<UserFacilityMapAttributes[]>;
        } catch (error) {
            return {
                data: [],
                success: false,
                message: error?.message || 'Failed to retrieve user facility maps',
                statusCode: 500
            } as ApiResponse<UserFacilityMapAttributes[]>;
        }
    }
}
