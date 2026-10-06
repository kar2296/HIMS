import {BaseService, BoFactory} from '../../Base/Index';
import { FeedbacksMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { FeedbacksMasterAttributes} from '../Model/Interface/Index';
import { FeedbacksMasterFilters } from '../Common/Filters.e';

export class FeedbacksMasterService extends BaseService {
    private FeedbacksMasterBo: FeedbacksMasterBo;
    constructor(req?: Request) {
        super(req);
        this.FeedbacksMasterBo = BoFactory.GetBo(FeedbacksMasterBo, this.Request);
    }

    public async AddFeedbacksMaster(req: BaseRequest): Promise<number> {
        return await this.FeedbacksMasterBo.AddFeedbacksMaster(req);
    }

    public async UpdateFeedbacksMaster(req: BaseRequest): Promise<boolean> {
        return await this.FeedbacksMasterBo.UpdateFeedbacksMaster(req);
    }

    public async GetFeedbacksMasterById(req: BaseRequest): Promise<FeedbacksMasterAttributes> {
        return await this.FeedbacksMasterBo.GetFeedbacksMasterById(req);
    }

    public async GetFeedbacksMasters(apiReq?: ApiRequest<FeedbacksMasterFilters>): Promise<ApiResponse<FeedbacksMasterAttributes[]>> {
        return await this.FeedbacksMasterBo.GetFeedbacksMasters(apiReq);
    }

    public async DeleteFeedbacksMaster(req: BaseRequest): Promise<Boolean> {
        return await this.FeedbacksMasterBo.DeleteFeedbacksMaster(req);
    }
}
