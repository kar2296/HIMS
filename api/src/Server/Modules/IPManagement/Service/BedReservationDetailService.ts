import { BaseService, BoFactory } from '../../Base/Index';
import { BedReservationDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedReservationDetailAttributes } from '../Model/Interface/Index';
import { BedReservationDetailFilters } from '../Common/Filters.e';

export class BedReservationDetailService extends BaseService {
    private BedReservationDetailBo: BedReservationDetailBo;
    constructor(req?: Request) {
        super(req);
        this.BedReservationDetailBo = BoFactory.GetBo(BedReservationDetailBo, this.Request);
    }

    public async AddBedReservationDetail(req: BaseRequest): Promise<number> {
        return await this.BedReservationDetailBo.AddBedReservationDetail(req);
    }

    public async UpdateBedReservationDetail(req: BaseRequest): Promise<boolean> {
        return await this.BedReservationDetailBo.UpdateBedReservationDetail(req);
    }

    public async GetBedReservationDetailById(req: BaseRequest): Promise<BedReservationDetailAttributes> {
        return await this.BedReservationDetailBo.GetBedReservationDetailById(req);
    }

    public async GetBedReservationDetails(apiReq?: ApiRequest<BedReservationDetailFilters>)
        : Promise<ApiResponse<BedReservationDetailAttributes[]>> {
        return await this.BedReservationDetailBo.GetBedReservationDetails(apiReq);
    }
    public async DeleteBedReservationDetail(req: BaseRequest): Promise<Boolean> {
        return await this.BedReservationDetailBo.DeleteBedReservationDetail(req);
    }
}
