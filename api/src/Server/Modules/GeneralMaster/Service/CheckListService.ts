import {BaseService, BoFactory} from '../../Base/Index';
import { CheckListBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { CheckListAttributes} from '../Model/Interface/Index';
import { CheckListFilters } from '../Common/Filters.e';

export class CheckListService extends BaseService {
    private CheckListBo: CheckListBo;
    constructor(req?: Request) {
        super(req);
        this.CheckListBo = BoFactory.GetBo(CheckListBo, this.Request);
    }

    public async AddCheckList(req: BaseRequest): Promise<number> {
        return await this.CheckListBo.AddCheckList(req);
    }

    public async UpdateCheckList(req: BaseRequest): Promise<boolean> {
        return await this.CheckListBo.UpdateCheckList(req);
    }

    public async GetCheckListById(req: BaseRequest): Promise<CheckListAttributes> {
        return await this.CheckListBo.GetCheckListById(req);
    }

    public async GetCheckLists(apiReq?: ApiRequest<CheckListFilters>): Promise<ApiResponse<CheckListAttributes[]>> {
        return await this.CheckListBo.GetCheckLists(apiReq);
    }

    public async DeleteCheckList(req: BaseRequest): Promise<Boolean> {
        return await this.CheckListBo.DeleteCheckList(req);
    }
}
