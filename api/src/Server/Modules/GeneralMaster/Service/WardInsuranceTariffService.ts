import { BaseService, BoFactory } from '../../Base/Index';
import { WardInsuranceTariffBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { WardInsuranceTariffAttributes } from '../Model/Interface/Index';
import { WardInsuranceTariffFilters } from '../Common/Filters.e';

export class WardInsuranceTariffService extends BaseService {
    private WardInsuranceTariffBo: WardInsuranceTariffBo;
    constructor(req?: Request) {
        super(req);
        this.WardInsuranceTariffBo = BoFactory.GetBo(WardInsuranceTariffBo, this.Request);
    }

    public async AddWardInsuranceTariff(req: BaseRequest): Promise<number> {
        return await this.WardInsuranceTariffBo.AddWardInsuranceTariff(req);
    }

    public async UpdateWardInsuranceTariff(req: BaseRequest): Promise<boolean> {
        return await this.WardInsuranceTariffBo.UpdateWardInsuranceTariff(req);
    }

    public async ManageWardInsuranceTariff(req: BaseRequest): Promise<boolean> {
        return await this.WardInsuranceTariffBo.ManageWardInsuranceTariff(req);
    }

    public async GetWardInsuranceTariffById(req: BaseRequest): Promise<WardInsuranceTariffAttributes> {
        return await this.WardInsuranceTariffBo.GetWardInsuranceTariffById(req);
    }

    public async GetWardInsuranceTariffs(apiReq?: ApiRequest<WardInsuranceTariffFilters>):
        Promise<ApiResponse<WardInsuranceTariffAttributes[]>> {
        return await this.WardInsuranceTariffBo.GetWardInsuranceTariffs(apiReq);
    }

    public async DeleteWardInsuranceTariff(req: BaseRequest): Promise<Boolean> {
        return await this.WardInsuranceTariffBo.DeleteWardInsuranceTariff(req);
    }
}
