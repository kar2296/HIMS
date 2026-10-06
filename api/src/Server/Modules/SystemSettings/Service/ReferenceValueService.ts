import {BaseService, BoFactory} from '../../Base/Index';
import { ReferenceValueBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ReferenceValueAttributes} from '../Model/Interface/Index';
import { ReferenceValueFilters } from '../Common/Filters.e';

export class ReferenceValueService extends BaseService {
    private ReferenceValueBo: ReferenceValueBo;
    constructor(req?: Request) {
        super(req);
        this.ReferenceValueBo = BoFactory.GetBo(ReferenceValueBo, this.Request);
    }

    public async AddReferenceValue(req: BaseRequest): Promise<number> {
        return await this.ReferenceValueBo.AddReferenceValue(req);
    }

    public async UpdateReferenceValue(req: BaseRequest): Promise<boolean> {
        return await this.ReferenceValueBo.UpdateReferenceValue(req);
    }

    public async GetReferenceValueById(req: BaseRequest): Promise<ReferenceValueAttributes> {
        return await this.ReferenceValueBo.GetReferenceValueById(req);
    }

    public async GetReferenceValues(apiReq?: ApiRequest<ReferenceValueFilters>): Promise<ApiResponse<ReferenceValueAttributes[]>> {
        return await this.ReferenceValueBo.GetReferenceValues(apiReq);
    }

    public async DeleteReferenceValue(req: BaseRequest): Promise<Boolean> {
        return await this.ReferenceValueBo.DeleteReferenceValue(req);
    }
}
