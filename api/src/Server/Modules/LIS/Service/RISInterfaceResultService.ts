import {BaseService, BoFactory} from '../../Base/Index';
import { RISInterfaceResultBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { RISInterfaceResultAttributes} from '../Model/Interface/Index';
import { RISInterfaceResultFilters } from '../Common/Filters.e';

export class RISInterfaceResultService extends BaseService {
    private RISInterfaceResultBo: RISInterfaceResultBo;
    constructor(req?: Request) {
        super(req);
        this.RISInterfaceResultBo = BoFactory.GetBo(RISInterfaceResultBo, this.Request);
    }

    public async AddRISInterfaceResult(req: BaseRequest): Promise<number> {
        return await this.RISInterfaceResultBo.AddRISInterfaceResult(req);
    }

    public async UpdateRISInterfaceResult(req: BaseRequest): Promise<boolean> {
        return await this.RISInterfaceResultBo.UpdateRISInterfaceResult(req);
    }

    public async GetRISInterfaceResultById(req: BaseRequest): Promise<RISInterfaceResultAttributes> {
        return await this.RISInterfaceResultBo.GetRISInterfaceResultById(req);
    }

    public async GetRISInterfaceResults(apiReq?: ApiRequest<RISInterfaceResultFilters>):
     Promise<ApiResponse<RISInterfaceResultAttributes[]>> {
        return await this.RISInterfaceResultBo.GetRISInterfaceResults(apiReq);
    }

    public async DeleteRISInterfaceResult(req: BaseRequest): Promise<Boolean> {
        return await this.RISInterfaceResultBo.DeleteRISInterfaceResult(req);
    }
}
