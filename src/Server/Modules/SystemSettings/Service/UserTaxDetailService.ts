import {BaseService, BoFactory} from '../../Base/Index';
import { UserTaxDetailBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { UserTaxDetailAttributes} from '../Model/Interface/Index';
import { UserTaxDetailFilters } from '../Common/Filters.e';

export class UserTaxDetailService extends BaseService {
    private UserTaxDetailBo: UserTaxDetailBo;
    constructor(req?: Request) {
        super(req);
        this.UserTaxDetailBo = BoFactory.GetBo(UserTaxDetailBo, this.Request);
    }

    public async AddUserTaxDetail(req: BaseRequest): Promise<number> {
        return await this.UserTaxDetailBo.AddUserTaxDetail(req);
    }

    public async UpdateUserTaxDetail(req: BaseRequest): Promise<boolean> {
        return await this.UserTaxDetailBo.UpdateUserTaxDetail(req);
    }

    public async GetUserTaxDetailById(req: BaseRequest): Promise<UserTaxDetailAttributes> {
        return await this.UserTaxDetailBo.GetUserTaxDetailById(req);
    }

    public async GetUserTaxDetails(apiReq?: ApiRequest<UserTaxDetailFilters>): Promise<Array<UserTaxDetailAttributes>> {
        return await this.UserTaxDetailBo.GetUserTaxDetails(apiReq);
    }

    public async DeleteUserTaxDetail(req: BaseRequest): Promise<Boolean> {
        return await this.UserTaxDetailBo.DeleteUserTaxDetail(req);
    }
}
