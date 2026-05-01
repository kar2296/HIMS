import { BaseService, BoFactory } from '../../Base/Index';
import { ModifiedPatientBillsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ModifiedPatientBillsAttributes } from '../Model/Interface/Index';
import { ModifiedPatientBillsFilters } from '../Common/Filters.e';

export class ModifiedPatientBillsService extends BaseService {
    private ModifiedPatientBillsBo: ModifiedPatientBillsBo;
    constructor(req?: Request) {
        super(req);
        this.ModifiedPatientBillsBo = BoFactory.GetBo(ModifiedPatientBillsBo, this.Request);
    }

    public async AddModifiedPatientBills(req: BaseRequest): Promise<number> {
        return await this.ModifiedPatientBillsBo.AddModifiedPatientBills(req);
    }

    public async UpdateModifiedPatientBills(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillsBo.UpdateModifiedPatientBills(req);
    }

    public async ManageModifiedPatientBills(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillsBo.ManageModifiedPatientBills(req);
    }

    public async ModifiyPatientBillDetails(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillsBo.ModifiyPatientBillDetails(req);
    }

    public async ManageModifiedOPPatientBills(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillsBo.ManageModifiedOPPatientBills(req);
    }

    public async ManageModifiedPharmacyPatientBills(req: BaseRequest): Promise<boolean> {
        return await this.ModifiedPatientBillsBo.ManageModifiedPharmacyPatientBills(req);
    }

    public async GetModifiedPatientBillById(req: BaseRequest): Promise<ModifiedPatientBillsAttributes> {
        return await this.ModifiedPatientBillsBo.GetModifiedPatientBillById(req);
    }

    public async GetModifiedPatientBillsById(apiReq?: ApiRequest<ModifiedPatientBillsFilters>):
        Promise<ApiResponse<ModifiedPatientBillsAttributes[]>> {
        return await this.ModifiedPatientBillsBo.GetModifiedPatientBillsById(apiReq);
    }

    public async GetModifiedPatientBills(apiReq?: ApiRequest<ModifiedPatientBillsFilters>):
        Promise<ApiResponse<ModifiedPatientBillsAttributes[]>> {
        return await this.ModifiedPatientBillsBo.GetModifiedPatientBills(apiReq);
    }

    public async DeleteModifiedPatientBills(req: BaseRequest): Promise<Boolean> {
        return await this.ModifiedPatientBillsBo.DeleteModifiedPatientBills(req);
    }
}
