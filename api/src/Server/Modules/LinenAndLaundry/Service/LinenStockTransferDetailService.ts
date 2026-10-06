import { BaseService, BoFactory } from '../../Base/Index';
import { LinenStockTransferDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LinenStockTransferDetailAttributes } from '../Model/Interface/Index';
import { LinenStockTransferDetailFilters } from '../Common/Filters.e';

export class LinenStockTransferDetailService extends BaseService {
    private LinenStockTransferDetailBo: LinenStockTransferDetailBo;
    constructor(req?: Request) {
        super(req);
        this.LinenStockTransferDetailBo = BoFactory.GetBo(LinenStockTransferDetailBo, this.Request);
    }

    public async AddLinenStockTransferDetail(req: BaseRequest): Promise<number> {
        return await this.LinenStockTransferDetailBo.AddLinenStockTransferDetail(req);
    }

    public async UpdateLinenStockTransferDetail(req: BaseRequest): Promise<boolean> {
        return await this.LinenStockTransferDetailBo.UpdateLinenStockTransferDetail(req);
    }

    public async GetLinenStockTransferDetailById(req: BaseRequest): Promise<LinenStockTransferDetailAttributes> {
        return await this.LinenStockTransferDetailBo.GetLinenStockTransferDetailById(req);
    }

    public async GetLinenStockTransferDetails(apiReq?: ApiRequest<LinenStockTransferDetailFilters>):
        Promise<ApiResponse<LinenStockTransferDetailAttributes[]>> {
        return await this.LinenStockTransferDetailBo.GetLinenStockTransferDetails(apiReq);
    }

    public async DeleteLinenStockTransferDetail(req: BaseRequest): Promise<Boolean> {
        return await this.LinenStockTransferDetailBo.DeleteLinenStockTransferDetail(req);
    }
}
