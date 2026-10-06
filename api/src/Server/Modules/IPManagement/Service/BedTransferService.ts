import { BaseService, BoFactory } from '../../Base/Index';
import { BedTransferBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { BedTransferAttributes } from '../Model/Interface/Index';
import { BedTransferFilters } from '../Common/Filters.e';

export class BedTransferService extends BaseService {
    private BedTransferBo: BedTransferBo;
    constructor(req?: Request) {
        super(req);
        this.BedTransferBo = BoFactory.GetBo(BedTransferBo, this.Request);
    }

    public async AddBedTransfer(req: BaseRequest): Promise<number> {
        return await this.BedTransferBo.AddBedTransfer(req);
    }

    public async UpdateBedTransfer(req: BaseRequest): Promise<boolean> {
        return await this.BedTransferBo.UpdateBedTransfer(req);
    }

    public async GetBedTransferById(req: BaseRequest): Promise<BedTransferAttributes> {
        return await this.BedTransferBo.GetBedTransferById(req);
    }

    public async GetBedTransfers(apiReq?: ApiRequest<BedTransferFilters>): Promise<ApiResponse<BedTransferAttributes[]>> {
        return await this.BedTransferBo.GetBedTransfers(apiReq);
    }
    public async GetBedTransferByEncounterId(apiReq?: ApiRequest<BedTransferFilters>): Promise<BedTransferAttributes> {
        return await this.BedTransferBo.GetBedTransferByEncounterId(apiReq);
    }
    public async PrintBedTransferReport(apiReq?: ApiRequest<BedTransferFilters>): Promise<any> {
        return await this.BedTransferBo.PrintBedTransferReport(apiReq);
    }
    public async DeleteBedTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.BedTransferBo.DeleteBedTransfer(req);
    }
}
