import {BaseService, BoFactory} from '../../Base/Index';
import { NotionalRentBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { NotionalRentAttributes} from '../Model/Interface/Index';
import { NotionalRentFilters } from '../Common/Filters.e';

export class NotionalRentService extends BaseService {
    private NotionalRentBo: NotionalRentBo;
    constructor(req?: Request) {
        super(req);
        this.NotionalRentBo = BoFactory.GetBo(NotionalRentBo, this.Request);
    }

    public async AddNotionalRent(req: BaseRequest): Promise<number> {
        return await this.NotionalRentBo.AddNotionalRent(req);
    }

    public async UpdateNotionalRent(req: BaseRequest): Promise<boolean> {
        return await this.NotionalRentBo.UpdateNotionalRent(req);
    }
     public async ManageNotionalRents(req: BaseRequest): Promise<boolean> {
        return await this.NotionalRentBo.ManageNotionalRents(req);
    }

    public async GetNotionalRentById(req: BaseRequest): Promise<NotionalRentAttributes> {
        return await this.NotionalRentBo.GetNotionalRentById(req);
    }

    public async GetNotionalRents(apiReq?: ApiRequest<NotionalRentFilters>): Promise<ApiResponse<NotionalRentAttributes[]>> {
        return await this.NotionalRentBo.GetNotionalRents(apiReq);
    }

    public async DeleteNotionalRent(req: BaseRequest): Promise<Boolean> {
        return await this.NotionalRentBo.DeleteNotionalRent(req);
    }
}
