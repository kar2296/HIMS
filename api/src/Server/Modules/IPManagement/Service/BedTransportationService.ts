import { BaseService, BoFactory } from '../../Base/Index';
import { BedTransportationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedTransportationAttributes } from '../Model/Interface/Index';
import { BedTransportationFilters } from '../Common/Filters.e';

export class BedTransportationService extends BaseService {
    private BedTransportationBo: BedTransportationBo;
    constructor(req?: Request) {
        super(req);
        this.BedTransportationBo = BoFactory.GetBo(BedTransportationBo, this.Request);
    }

    public async AddBedTransportation(req: BaseRequest): Promise<number> {
        return await this.BedTransportationBo.AddBedTransportation(req);
    }

    public async UpdateBedTransportation(req: BaseRequest): Promise<boolean> {
        return await this.BedTransportationBo.UpdateBedTransportation(req);
    }

    public async GetBedTransportationById(req: BaseRequest): Promise<BedTransportationAttributes> {
        return await this.BedTransportationBo.GetBedTransportationById(req);
    }

    public async GetBedTransportations(apiReq?: ApiRequest<BedTransportationFilters>): Promise<ApiResponse<BedTransportationAttributes[]>> {
        return await this.BedTransportationBo.GetBedTransportations(apiReq);
    }

    public async DeleteBedTransportation(req: BaseRequest): Promise<Boolean> {
        return await this.BedTransportationBo.DeleteBedTransportation(req);
    }
}
