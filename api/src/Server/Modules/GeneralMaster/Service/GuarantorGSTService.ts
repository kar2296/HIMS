import {BaseService, BoFactory} from '../../Base/Index';
import { GuarantorGSTBo} from '../Business/Index';
import {ApiRequest, BaseRequest } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { GuarantorGSTAttributes} from '../Model/Interface/Index';
import { GuarantorGSTFilters } from '../Common/Filters.e';

export class GuarantorGSTService extends BaseService {
    private GuarantorGSTBo: GuarantorGSTBo;
    constructor(req?: Request) {
        super(req);
        this.GuarantorGSTBo = BoFactory.GetBo(GuarantorGSTBo, this.Request);
    }

    public async AddGuarantorGST(req: BaseRequest): Promise<number> {
        return await this.GuarantorGSTBo.AddGuarantorGST(req);
    }

    public async UpdateGuarantorGST(req: BaseRequest): Promise<boolean> {
        return await this.GuarantorGSTBo.UpdateGuarantorGST(req);
    }

    public async GetGuarantorGSTById(req: BaseRequest): Promise<GuarantorGSTAttributes> {
        return await this.GuarantorGSTBo.GetGuarantorGSTById(req);
    }

    public async GetGuarantorGSTs(apiReq?: ApiRequest<GuarantorGSTFilters>): Promise<Array<GuarantorGSTAttributes>> {
        return await this.GuarantorGSTBo.GetGuarantorGSTs(apiReq);
    }

    public async DeleteGuarantorGST(req: BaseRequest): Promise<Boolean> {
        return await this.GuarantorGSTBo.DeleteGuarantorGST(req);
    }
}
