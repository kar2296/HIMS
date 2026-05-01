import {BaseService, BoFactory} from '../../Base/Index';
import { SpecialityBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { SpecialityAttributes} from '../Model/Interface/Index';
import { SpecialityFilters } from '../Common/Filters.e';

export class SpecialityService extends BaseService {
    private SpecialityBo: SpecialityBo;
    constructor(req?: Request) {
        super(req);
        this.SpecialityBo = BoFactory.GetBo(SpecialityBo, this.Request);
    }

    public async AddSpeciality(req: BaseRequest): Promise<number> {
        return await this.SpecialityBo.AddSpeciality(req);
    }

    public async UpdateSpeciality(req: BaseRequest): Promise<boolean> {
        return await this.SpecialityBo.UpdateSpeciality(req);
    }

    public async GetSpecialityById(req: BaseRequest): Promise<SpecialityAttributes> {
        return await this.SpecialityBo.GetSpecialityById(req);
    }

    public async GetSpecialitys(apiReq?: ApiRequest<SpecialityFilters>): Promise<ApiResponse<SpecialityAttributes[]>> {
        return await this.SpecialityBo.GetSpecialitys(apiReq);
    }

    public async DeleteSpeciality(req: BaseRequest): Promise<Boolean> {
        return await this.SpecialityBo.DeleteSpeciality(req);
    }
}
