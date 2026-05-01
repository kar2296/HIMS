import { BaseService, BoFactory } from '../../Base/Index';
import { BedHousekeepingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedHousekeepingAttributes } from '../Model/Interface/Index';
import { BedHousekeepingFilters } from '../Common/Filters.e';

export class BedHousekeepingService extends BaseService {
    private BedHousekeepingBo: BedHousekeepingBo;
    constructor(req?: Request) {
        super(req);
        this.BedHousekeepingBo = BoFactory.GetBo(BedHousekeepingBo, this.Request);
    }

    public async AddBedHousekeeping(req: BaseRequest): Promise<number> {
        return await this.BedHousekeepingBo.AddBedHousekeeping(req);
    }

    public async UpdateBedHousekeeping(req: BaseRequest): Promise<boolean> {
        return await this.BedHousekeepingBo.UpdateBedHousekeeping(req);
    }

    public async GetBedHousekeepingById(req: BaseRequest): Promise<BedHousekeepingAttributes> {
        return await this.BedHousekeepingBo.GetBedHousekeepingById(req);
    }

    public async GetBedHousekeepings(apiReq?: ApiRequest<BedHousekeepingFilters>): Promise<ApiResponse<BedHousekeepingAttributes[]>> {
        return await this.BedHousekeepingBo.GetBedHousekeepings(apiReq);
    }

    public async DeleteBedHousekeeping(req: BaseRequest): Promise<Boolean> {
        return await this.BedHousekeepingBo.DeleteBedHousekeeping(req);
    }
}
