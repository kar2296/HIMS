import {BaseService, BoFactory} from '../../Base/Index';
import { GenericMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { GenericMasterAttributes} from '../Model/Interface/Index';
import { GenericMasterFilters } from '../Common/Filters.e';

export class GenericMasterService extends BaseService {
    private GenericMasterBo: GenericMasterBo;
    constructor(req?: Request) {
        super(req);
        this.GenericMasterBo = BoFactory.GetBo(GenericMasterBo, this.Request);
    }

    public async AddGenericMaster(req: BaseRequest): Promise<number> {
        return await this.GenericMasterBo.AddGenericMaster(req);
    }

    public async UpdateGenericMaster(req: BaseRequest): Promise<boolean> {
        return await this.GenericMasterBo.UpdateGenericMaster(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.GenericMasterBo.GetMaxId(req);
    }

    public async GetGenericMasterById(req: BaseRequest): Promise<GenericMasterAttributes> {
        return await this.GenericMasterBo.GetGenericMasterById(req);
    }

    public async GetGenericMasters(apiReq?: ApiRequest<GenericMasterFilters>): Promise<ApiResponse<GenericMasterAttributes[]>> {
        return await this.GenericMasterBo.GetGenericMasters(apiReq);
    }

    public async PrintGenericMasterReport(apiReq?: ApiRequest<GenericMasterFilters>): Promise<any> {
        return await this.GenericMasterBo.PrintGenericMasterReport(apiReq);
    }

    public async DeleteGenericMaster(req: BaseRequest): Promise<Boolean> {
        return await this.GenericMasterBo.DeleteGenericMaster(req);
    }
}
