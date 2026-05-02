import { BaseService, BoFactory } from '../../Base/Index';
import { BedHousekeepinglogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedHousekeepinglogAttributes } from '../Model/Interface/Index';
import { BedHousekeepinglogFilters } from '../Common/Filters.e';

export class BedHousekeepinglogService extends BaseService {
    private BedHousekeepinglogBo: BedHousekeepinglogBo;
    constructor(req?: Request) {
        super(req);
        this.BedHousekeepinglogBo = BoFactory.GetBo(BedHousekeepinglogBo, this.Request);
    }

    public async AddBedHousekeepinglog(req: BaseRequest): Promise<number> {
        return await this.BedHousekeepinglogBo.AddBedHousekeepinglog(req);
    }

    public async UpdateBedHousekeepinglog(req: BaseRequest): Promise<boolean> {
        return await this.BedHousekeepinglogBo.UpdateBedHousekeepinglog(req);
    }

    public async GetBedHousekeepinglogById(req: BaseRequest): Promise<BedHousekeepinglogAttributes> {
        return await this.BedHousekeepinglogBo.GetBedHousekeepinglogById(req);
    }

    public async GetBedHousekeepinglogs(apiReq?: ApiRequest<BedHousekeepinglogFilters>):
    Promise<ApiResponse<BedHousekeepinglogAttributes[]>> {
        return await this.BedHousekeepinglogBo.GetBedHousekeepinglogs(apiReq);
    }

    public async DeleteBedHousekeepinglog(req: BaseRequest): Promise<Boolean> {
        return await this.BedHousekeepinglogBo.DeleteBedHousekeepinglog(req);
    }
}
