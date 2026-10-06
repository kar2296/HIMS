import {BaseService, BoFactory} from '../../Base/Index';
import { DosageLimitBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DosageLimitAttributes} from '../Model/Interface/Index';
import { DosageLimitFilters } from '../Common/Filters.e';

export class DosageLimitService extends BaseService {
    private DosageLimitBo: DosageLimitBo;
    constructor(req?: Request) {
        super(req);
        this.DosageLimitBo = BoFactory.GetBo(DosageLimitBo, this.Request);
    }

    public async AddDosageLimit(req: BaseRequest): Promise<number> {
        return await this.DosageLimitBo.AddDosageLimit(req);
    }

    public async UpdateDosageLimit(req: BaseRequest): Promise<boolean> {
        return await this.DosageLimitBo.UpdateDosageLimit(req);
    }

    public async GetDosageLimitById(req: BaseRequest): Promise<DosageLimitAttributes> {
        return await this.DosageLimitBo.GetDosageLimitById(req);
    }

    public async GetDosageLimits(apiReq?: ApiRequest<DosageLimitFilters>): Promise<Array<DosageLimitAttributes>> {
        return await this.DosageLimitBo.GetDosageLimits(apiReq);
    }

    public async DeleteDosageLimit(req: BaseRequest): Promise<Boolean> {
        return await this.DosageLimitBo.DeleteDosageLimit(req);
    }
}
