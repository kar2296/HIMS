import {BaseService, BoFactory} from '../../Base/Index';
import { ChiefComplaintBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ChiefComplaintAttributes} from '../Model/Interface/Index';
import { ChiefComplaintFilters } from '../Common/Filters.e';

export class ChiefComplaintService extends BaseService {
    private ChiefComplaintBo: ChiefComplaintBo;
    constructor(req?: Request) {
        super(req);
        this.ChiefComplaintBo = BoFactory.GetBo(ChiefComplaintBo, this.Request);
    }

    public async AddChiefComplaint(req: BaseRequest): Promise<number> {
        return await this.ChiefComplaintBo.AddChiefComplaint(req);
    }

    public async UpdateChiefComplaint(req: BaseRequest): Promise<boolean> {
        return await this.ChiefComplaintBo.UpdateChiefComplaint(req);
    }

    public async GetChiefComplaintById(req: BaseRequest): Promise<ChiefComplaintAttributes> {
        return await this.ChiefComplaintBo.GetChiefComplaintById(req);
    }

    public async GetChiefComplaints(apiReq?: ApiRequest<ChiefComplaintFilters>): Promise<ApiResponse<ChiefComplaintAttributes[]>> {
        return await this.ChiefComplaintBo.GetChiefComplaints(apiReq);
    }

    public async DeleteChiefComplaint(req: BaseRequest): Promise<Boolean> {
        return await this.ChiefComplaintBo.DeleteChiefComplaint(req);
    }
}
