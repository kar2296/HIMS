import {BaseService, BoFactory} from '../../Base/Index';
import { ImmunizationBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ImmunizationAttributes} from '../Model/Interface/Index';
import { ImmunizationFilters } from '../Common/Filters.e';

export class ImmunizationService extends BaseService {
    private ImmunizationBo: ImmunizationBo;
    constructor(req?: Request) {
        super(req);
        this.ImmunizationBo = BoFactory.GetBo(ImmunizationBo, this.Request);
    }

    public async AddImmunization(req: BaseRequest): Promise<number> {
        return await this.ImmunizationBo.AddImmunization(req);
    }

    public async UpdateImmunization(req: BaseRequest): Promise<boolean> {
        return await this.ImmunizationBo.UpdateImmunization(req);
    }

    public async GetImmunizationById(req: BaseRequest): Promise<ImmunizationAttributes> {
        return await this.ImmunizationBo.GetImmunizationById(req);
    }

    public async GetImmunizations(apiReq?: ApiRequest<ImmunizationFilters>): Promise<ApiResponse<ImmunizationAttributes[]>> {
        return await this.ImmunizationBo.GetImmunizations(apiReq);
    }

    public async DeleteImmunization(req: BaseRequest): Promise<Boolean> {
        return await this.ImmunizationBo.DeleteImmunization(req);
    }
}
