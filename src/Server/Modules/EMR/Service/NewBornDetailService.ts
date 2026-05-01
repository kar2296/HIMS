import {BaseService, BoFactory} from '../../Base/Index';
import { NewBornDetailBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { NewBornDetailAttributes} from '../Model/Interface/Index';
import { NewBornDetailFilters } from '../Common/Filters.e';

export class NewBornDetailService extends BaseService {
    private NewBornDetailBo: NewBornDetailBo;
    constructor(req?: Request) {
        super(req);
        this.NewBornDetailBo = BoFactory.GetBo(NewBornDetailBo, this.Request);
    }

    public async AddNewBornDetail(req: BaseRequest): Promise<number> {
        return await this.NewBornDetailBo.AddNewBornDetail(req);
    }

    public async UpdateNewBornDetail(req: BaseRequest): Promise<boolean> {
        return await this.NewBornDetailBo.UpdateNewBornDetail(req);
    }

    public async GetNewBornDetailById(req: BaseRequest): Promise<NewBornDetailAttributes> {
        return await this.NewBornDetailBo.GetNewBornDetailById(req);
    }

    public async GetNewBornDetails(apiReq?: ApiRequest<NewBornDetailFilters>):
     Promise<ApiResponse<NewBornDetailAttributes[]>> {
        return await this.NewBornDetailBo.GetNewBornDetails(apiReq);
    }

    public async DeleteNewBornDetail(req: BaseRequest): Promise<Boolean> {
        return await this.NewBornDetailBo.DeleteNewBornDetail(req);
    }

    public async PrintNewBornDetail(req: BaseRequest): Promise<FileInfo> {
        return await this.NewBornDetailBo.PrintNewBornDetail(req);
    }
}
