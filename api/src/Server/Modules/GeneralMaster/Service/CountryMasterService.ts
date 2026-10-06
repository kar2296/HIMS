import {BaseService, BoFactory} from '../../Base/Index';
import { CountryMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { CountryMasterAttributes} from '../Model/Interface/Index';
import { CountryMasterFilters } from '../Common/Filters.e';

export class CountryMasterService extends BaseService {
    private CountryMasterBo: CountryMasterBo;
    constructor(req?: Request) {
        super(req);
        this.CountryMasterBo = BoFactory.GetBo(CountryMasterBo, this.Request);
    }

    public async AddCountryMaster(req: BaseRequest): Promise<number> {
        return await this.CountryMasterBo.AddCountryMaster(req);
    }

    public async UpdateCountryMaster(req: BaseRequest): Promise<boolean> {
        return await this.CountryMasterBo.UpdateCountryMaster(req);
    }

    public async GetCountryMasterById(req: BaseRequest): Promise<CountryMasterAttributes> {
        return await this.CountryMasterBo.GetCountryMasterById(req);
    }

    public async GetCountryMasters(apiReq?: ApiRequest<CountryMasterFilters>): Promise<ApiResponse<CountryMasterAttributes[]>> {
        return await this.CountryMasterBo.GetCountryMasters(apiReq);
    }

    public async DeleteCountryMaster(req: BaseRequest): Promise<Boolean> {
        return await this.CountryMasterBo.DeleteCountryMaster(req);
    }
}
