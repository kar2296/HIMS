import { BaseService, BoFactory } from '../../Base/Index';
import { LinenStockEntryDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { LinenStockEntryDetailAttributes } from '../Model/Interface/Index';
import { LinenStockEntryDetailFilters } from '../Common/Filters.e';

export class LinenStockEntryDetailService extends BaseService {
    private LinenStockEntryDetailBo: LinenStockEntryDetailBo;
    constructor(req?: Request) {
        super(req);
        this.LinenStockEntryDetailBo = BoFactory.GetBo(LinenStockEntryDetailBo, this.Request);
    }

    public async AddLinenStockEntryDetail(req: BaseRequest): Promise<number> {
        return await this.LinenStockEntryDetailBo.AddLinenStockEntryDetail(req);
    }

    public async UpdateLinenStockEntryDetail(req: BaseRequest): Promise<boolean> {
        return await this.LinenStockEntryDetailBo.UpdateLinenStockEntryDetail(req);
    }

    public async GetLinenStockEntryDetailById(req: BaseRequest): Promise<LinenStockEntryDetailAttributes> {
        return await this.LinenStockEntryDetailBo.GetLinenStockEntryDetailById(req);
    }

    public async GetLinenStockEntryDetails(apiReq?: ApiRequest<LinenStockEntryDetailFilters>):
        Promise<ApiResponse<LinenStockEntryDetailAttributes[]>> {
        return await this.LinenStockEntryDetailBo.GetLinenStockEntryDetails(apiReq);
    }

    public async DeleteLinenStockEntryDetail(req: BaseRequest): Promise<Boolean> {
        return await this.LinenStockEntryDetailBo.DeleteLinenStockEntryDetail(req);
    }
}
