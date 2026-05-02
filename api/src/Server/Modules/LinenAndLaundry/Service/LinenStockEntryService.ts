import { BaseService, BoFactory } from '../../Base/Index';
import { LinenStockEntryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request} from '../../../Core/Index';
import { LinenStockEntryAttributes } from '../Model/Interface/Index';
import { LinenStockEntryFilters } from '../Common/Filters.e';

export class LinenStockEntryService extends BaseService {
    private LinenStockEntryBo: LinenStockEntryBo;
    constructor(req?: Request) {
        super(req);
        this.LinenStockEntryBo = BoFactory.GetBo(LinenStockEntryBo, this.Request);
    }

    public async AddLinenStockEntry(req: BaseRequest): Promise<number> {
        return await this.LinenStockEntryBo.AddLinenStockEntry(req);
    }

    public async UpdateLinenStockEntry(req: BaseRequest): Promise<boolean> {
        return await this.LinenStockEntryBo.UpdateLinenStockEntry(req);
    }

    public async GetLinenStockEntryById(req: BaseRequest): Promise<LinenStockEntryAttributes> {
        return await this.LinenStockEntryBo.GetLinenStockEntryById(req);
    }

    public async GetLinenStockEntrys(apiReq?: ApiRequest<LinenStockEntryFilters>): Promise<ApiResponse<LinenStockEntryAttributes[]>> {
        return await this.LinenStockEntryBo.GetLinenStockEntrys(apiReq);
    }

    public async DeleteLinenStockEntry(req: BaseRequest): Promise<Boolean> {
        return await this.LinenStockEntryBo.DeleteLinenStockEntry(req);
    }
}
