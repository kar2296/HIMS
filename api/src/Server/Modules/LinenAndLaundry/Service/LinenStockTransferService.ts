import { BaseService, BoFactory } from '../../Base/Index';
import { LinenStockTransferBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LinenStockTransferAttributes } from '../Model/Interface/Index';
import { LinenStockTransferFilters } from '../Common/Filters.e';

export class LinenStockTransferService extends BaseService {
    private LinenStockTransferBo: LinenStockTransferBo;
    constructor(req?: Request) {
        super(req);
        this.LinenStockTransferBo = BoFactory.GetBo(LinenStockTransferBo, this.Request);
    }

    public async AddLinenStockTransfer(req: BaseRequest): Promise<number> {
        return await this.LinenStockTransferBo.AddLinenStockTransfer(req);
    }

    public async UpdateLinenStockTransfer(req: BaseRequest): Promise<boolean> {
        return await this.LinenStockTransferBo.UpdateLinenStockTransfer(req);
    }

    public async GetLinenStockTransferById(req: BaseRequest): Promise<LinenStockTransferAttributes> {
        return await this.LinenStockTransferBo.GetLinenStockTransferById(req);
    }

    public async GetLinenStockTransfers(apiReq?: ApiRequest<LinenStockTransferFilters>):
        Promise<ApiResponse<LinenStockTransferAttributes[]>> {
        return await this.LinenStockTransferBo.GetLinenStockTransfers(apiReq);
    }

    public async DeleteLinenStockTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.LinenStockTransferBo.DeleteLinenStockTransfer(req);
    }
}
