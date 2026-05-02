import { BaseService, BoFactory } from '../../Base/Index';
import { BedOccupancyHistoryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedOccupancyHistoryAttributes } from '../Model/Interface/Index';
import { BedOccupancyHistoryFilters } from '../Common/Filters.e';

export class BedOccupancyHistoryService extends BaseService {
    private BedOccupancyHistoryBo: BedOccupancyHistoryBo;
    constructor(req?: Request) {
        super(req);
        this.BedOccupancyHistoryBo = BoFactory.GetBo(BedOccupancyHistoryBo, this.Request);
    }

    public async AddBedOccupancyHistory(req: BaseRequest): Promise<number> {
        return await this.BedOccupancyHistoryBo.AddBedOccupancyHistory(req);
    }

    public async UpdateBedOccupancyHistory(req: BaseRequest): Promise<boolean> {
        return await this.BedOccupancyHistoryBo.UpdateBedOccupancyHistory(req);
    }

    public async ManageBedOccupancyUpDownTariff(req: BaseRequest): Promise<any> {
        return await this.BedOccupancyHistoryBo.ManageBedOccupancyUpDownTariff(req);
    }

    public async GetBedOccupancyHistoryById(req: BaseRequest): Promise<BedOccupancyHistoryAttributes> {
        return await this.BedOccupancyHistoryBo.GetBedOccupancyHistoryById(req);
    }
    public async PrintBedOccupancyHistorys(apiReq?: ApiRequest<BedOccupancyHistoryFilters>): Promise<any> {
        return await this.BedOccupancyHistoryBo.PrintBedOccupancyHistorys(apiReq);
    }
    public async GetBedOccupancyHistorys(apiReq?: ApiRequest<BedOccupancyHistoryFilters>):
        Promise<ApiResponse<BedOccupancyHistoryAttributes[]>> {
        return await this.BedOccupancyHistoryBo.GetBedOccupancyHistorys(apiReq);
    }

    public async DeleteBedOccupancyHistory(req: BaseRequest): Promise<Boolean> {
        return await this.BedOccupancyHistoryBo.DeleteBedOccupancyHistory(req);
    }

    public async DischargeAttenderBed(req: BaseRequest): Promise<Boolean> {
        return await this.BedOccupancyHistoryBo.DischargeAttenderBed(req);
    }

}
