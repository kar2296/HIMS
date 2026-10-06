import { BaseService, BoFactory } from '../../Base/Index';
import { CarePathBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { CarePathAttributes } from '../Model/Interface/Index';
import { CarePathFilters } from '../Common/Filters.e';

export class CarePathService extends BaseService {
    private CarePathBo: CarePathBo;
    constructor(req?: Request) {
        super(req);
        this.CarePathBo = BoFactory.GetBo(CarePathBo, this.Request);
    }

    public async AddCarePath(req: BaseRequest): Promise<number> {
        return await this.CarePathBo.AddCarePath(req);
    }

    public async UpdateCarePath(req: BaseRequest): Promise<boolean> {
        return await this.CarePathBo.UpdateCarePath(req);
    }
    public async GetItemLogo(req: BaseRequest): Promise<CarePathAttributes> {
        return await this.CarePathBo.GetItemLogo(req);
    }
    public async GetCarePathById(req: BaseRequest): Promise<CarePathAttributes> {
        return await this.CarePathBo.GetCarePathById(req);
    }

    public async GetCarePaths(apiReq?: ApiRequest<CarePathFilters>): Promise<ApiResponse<CarePathAttributes[]>> {
        return await this.CarePathBo.GetCarePaths(apiReq);
    }

    public async DeleteCarePath(req: BaseRequest): Promise<Boolean> {
        return await this.CarePathBo.DeleteCarePath(req);
    }
}
