import { BaseService, BoFactory } from '../../Base/Index';
import { BedtransportationlogBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedtransportationlogAttributes } from '../Model/Interface/Index';
import { BedtransportationlogFilters } from '../Common/Filters.e';

export class BedtransportationlogService extends BaseService {
    private BedtransportationlogBo: BedtransportationlogBo;
    constructor(req?: Request) {
        super(req);
        this.BedtransportationlogBo = BoFactory.GetBo(BedtransportationlogBo, this.Request);
    }

    public async AddBedtransportationlog(req: BaseRequest): Promise<number> {
        return await this.BedtransportationlogBo.AddBedtransportationlog(req);
    }

    public async UpdateBedtransportationlog(req: BaseRequest): Promise<boolean> {
        return await this.BedtransportationlogBo.UpdateBedtransportationlog(req);
    }

    public async GetBedtransportationlogById(req: BaseRequest): Promise<BedtransportationlogAttributes> {
        return await this.BedtransportationlogBo.GetBedtransportationlogById(req);
    }

    public async GetBedtransportationlogs(apiReq?: ApiRequest<BedtransportationlogFilters>):
    Promise<ApiResponse<BedtransportationlogAttributes[]>> {
        return await this.BedtransportationlogBo.GetBedtransportationlogs(apiReq);
    }

    public async DeleteBedtransportationlog(req: BaseRequest): Promise<Boolean> {
        return await this.BedtransportationlogBo.DeleteBedtransportationlog(req);
    }
}
