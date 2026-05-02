import { BaseService, BoFactory } from '../../Base/Index';
import { GuarantorSupplementaryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GuarantorSupplementaryAttributes } from '../Model/Interface/Index';
import { GuarantorSupplementaryFilters } from '../Common/Filters.e';

export class GuarantorSupplementaryService extends BaseService {
    private GuarantorSupplementaryBo: GuarantorSupplementaryBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorSupplementaryBo = BoFactory.GetBo(GuarantorSupplementaryBo, this.Request);
    }

    public async AddGuarantorSupplementary(req: BaseRequest): Promise<number> {
        return await this.GuarantorSupplementaryBo.AddGuarantorSupplementary(req);
    }

    public async UpdateGuarantorSupplementary(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorSupplementaryBo.UpdateGuarantorSupplementary(req);
    }

    public async ManageGuarantorSupplementary(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorSupplementaryBo.ManageGuarantorSupplementary(req);
    }

    public async GetGuarantorSupplementaryById(req: BaseRequest): Promise<GuarantorSupplementaryAttributes> {
        return await this.GuarantorSupplementaryBo.GetGuarantorSupplementaryById(req);
    }

    public async GetGuarantorSupplementarys(
        apiReq?: ApiRequest<GuarantorSupplementaryFilters>): Promise<ApiResponse<GuarantorSupplementaryAttributes[]>> {
        return await this.GuarantorSupplementaryBo.GetGuarantorSupplementarys(apiReq);
    }

    public async DeleteGuarantorSupplementary(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorSupplementaryBo.DeleteGuarantorSupplementary(req);
    }
}
