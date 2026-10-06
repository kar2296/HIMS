import {BaseService, BoFactory} from '../../Base/Index';
import { GuarantorCardTypeBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { GuarantorCardTypeAttributes} from '../Model/Interface/Index';
import { GuarantorCardTypeFilters } from '../Common/Filters.e';

export class GuarantorCardTypeService extends BaseService {
    private GuarantorCardTypeBo: GuarantorCardTypeBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorCardTypeBo = BoFactory.GetBo(GuarantorCardTypeBo, this.Request);
    }

    public async AddGuarantorCardType(req: BaseRequest): Promise<number> {
        return await this.GuarantorCardTypeBo.AddGuarantorCardType(req);
    }

    public async UpdateGuarantorCardType(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorCardTypeBo.UpdateGuarantorCardType(req);
    }

    public async GetGuarantorCardTypeById(req: BaseRequest): Promise<GuarantorCardTypeAttributes> {
        return await this.GuarantorCardTypeBo.GetGuarantorCardTypeById(req);
    }

    public async GetGuarantorCardTypes(apiReq?: ApiRequest<GuarantorCardTypeFilters>): Promise<ApiResponse<GuarantorCardTypeAttributes[]>> {
        return await this.GuarantorCardTypeBo.GetGuarantorCardTypes(apiReq);
    }

    public async DeleteGuarantorCardType(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorCardTypeBo.DeleteGuarantorCardType(req);
    }

    public async GetSelfGuarantorCardType(req: BaseRequest): Promise<GuarantorCardTypeAttributes> {
        return await this.GuarantorCardTypeBo.GetSelfGuarantorCardType();
    }
}
