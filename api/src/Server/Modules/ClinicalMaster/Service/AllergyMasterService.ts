import {BaseService, BoFactory} from '../../Base/Index';
import { AllergyMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { AllergyMasterAttributes} from '../Model/Interface/Index';
import { AllergyFilters } from '../Common/Filters.e';

export class AllergyMasterService extends BaseService {
    private AllergyMasterBo: AllergyMasterBo;
    constructor(req?: Request) {
        super(req);
        this.AllergyMasterBo = BoFactory.GetBo(AllergyMasterBo, this.Request);
    }

    public async AddAllergyMaster(req: BaseRequest): Promise<number> {
        return await this.AllergyMasterBo.AddAllergyMaster(req);
    }

    public async UpdateAllergyMaster(req: BaseRequest): Promise<boolean> {
        return await this.AllergyMasterBo.UpdateAllergyMaster(req);
    }

    public async GetAllergyMasterById(req: BaseRequest): Promise<AllergyMasterAttributes> {
        return await this.AllergyMasterBo.GetAllergyMasterById(req);
    }

    public async GetAllergyMasters(apiReq?: ApiRequest<AllergyFilters>): Promise<ApiResponse<AllergyMasterAttributes[]>> {
        return await this.AllergyMasterBo.GetAllergyMasters(apiReq);
    }

    public async DeleteAllergyMaster(req: BaseRequest): Promise<Boolean> {
        return await this.AllergyMasterBo.DeleteAllergyMaster(req);
    }
}
