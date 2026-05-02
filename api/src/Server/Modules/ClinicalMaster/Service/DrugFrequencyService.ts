import {BaseService, BoFactory } from '../../Base/Index';
import { DrugFrequencyBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DrugFrequencyAttributes } from '../Model/Interface/Index';
import { DrugFrequencyFilters } from '../Common/Filters.e';

export class DrugFrequencyService extends BaseService {
    private DrugFrequencyBo: DrugFrequencyBo;
    constructor(req?: Request) {
        super(req);
        this.DrugFrequencyBo = BoFactory.GetBo(DrugFrequencyBo, this.Request);
    }

    public async AddDrugFrequency(req: BaseRequest): Promise<number> {
        return await this.DrugFrequencyBo.AddDrugFrequency(req);
    }

    public async UpdateDrugFrequency(req: BaseRequest): Promise<boolean> {
        return await this.DrugFrequencyBo.UpdateDrugFrequency(req);
    }

    public async GetDrugFrequencyById(req: BaseRequest): Promise<DrugFrequencyAttributes> {
        return await this.DrugFrequencyBo.GetDrugFrequencyById(req);
    }

    public async GetDrugFrequencys(apiReq?: ApiRequest<DrugFrequencyFilters>): Promise<ApiResponse<DrugFrequencyAttributes[]>> {
        return await this.DrugFrequencyBo.GetDrugFrequencys(apiReq);
    }

    public async DeleteDrugFrequency(req: BaseRequest): Promise<Boolean> {
        return await this.DrugFrequencyBo.DeleteDrugFrequency(req);
    }
}
