import { BaseService, BoFactory } from '../../Base/Index';
import { NewAssetRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { NewAssetRequestAttributes } from '../Model/Interface/Index';
import { NewAssetRequestFilters } from '../Common/Filters.e';

export class NewAssetRequestService extends BaseService {
    private NewAssetRequestBo: NewAssetRequestBo;
    constructor(req?: Request) {
        super(req);
        this.NewAssetRequestBo = BoFactory.GetBo(NewAssetRequestBo, this.Request);
    }

    public async AddNewAssetRequest(req: BaseRequest): Promise<number> {
        return await this.NewAssetRequestBo.AddNewAssetRequest(req);
    }

    public async UpdateNewAssetRequest(req: BaseRequest): Promise<boolean> {
        return await this.NewAssetRequestBo.UpdateNewAssetRequest(req);
    }

    public async GetNewAssetRequestById(req: BaseRequest): Promise<NewAssetRequestAttributes> {
        return await this.NewAssetRequestBo.GetNewAssetRequestById(req);
    }

    public async GetNewAssetRequests(apiReq?: ApiRequest<NewAssetRequestFilters>): Promise<ApiResponse<NewAssetRequestAttributes[]>> {
        return await this.NewAssetRequestBo.GetNewAssetRequests(apiReq);
    }

    public async DeleteNewAssetRequest(req: BaseRequest): Promise<Boolean> {
        return await this.NewAssetRequestBo.DeleteNewAssetRequest(req);
    }

    public async PrintNewAssetRequestReport(apiReq?: ApiRequest<NewAssetRequestFilters>): Promise<any> {
        return await this.NewAssetRequestBo.PrintNewAssetRequestReport(apiReq);
    }
}
