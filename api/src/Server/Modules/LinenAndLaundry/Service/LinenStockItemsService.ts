import {BaseService, BoFactory} from '../../Base/Index';
import { LinenStockItemsBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { LinenStockItemsAttributes} from '../Model/Interface/Index';
import { LinenStockItemsFilters } from '../Common/Filters.e';

export class LinenStockItemsService extends BaseService {
    private LinenStockItemsBo: LinenStockItemsBo;
    constructor(req?: Request) {
        super(req);
        this.LinenStockItemsBo = BoFactory.GetBo(LinenStockItemsBo, this.Request);
    }

    public async AddLinenStockItems(req: BaseRequest): Promise<number> {
        return await this.LinenStockItemsBo.AddLinenStockItems(req);
    }

    public async UpdateLinenStockItems(req: BaseRequest): Promise<boolean> {
        return await this.LinenStockItemsBo.UpdateLinenStockItems(req);
    }

    public async GetLinenStockItemsById(req: BaseRequest): Promise<LinenStockItemsAttributes> {
        return await this.LinenStockItemsBo.GetLinenStockItemsById(req);
    }

    public async GetLinenStockItems(apiReq?: ApiRequest<LinenStockItemsFilters>): Promise<ApiResponse<LinenStockItemsAttributes[]>> {
        return await this.LinenStockItemsBo.GetLinenStockItems(apiReq);
    }

    public async DeleteLinenStockItems(req: BaseRequest): Promise<Boolean> {
        return await this.LinenStockItemsBo.DeleteLinenStockItems(req);
    }
}
