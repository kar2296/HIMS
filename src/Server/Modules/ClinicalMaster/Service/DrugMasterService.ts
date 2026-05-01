import {BaseService, BoFactory} from '../../Base/Index';
import { DrugMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ISearchEnums, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DrugMasterAttributes, DrugDiagnosisMapAttributes} from '../Model/Interface/Index';
import { DrugMasterFilters } from '../Common/Filters.e';

export class DrugMasterService extends BaseService {
    private DrugMasterBo: DrugMasterBo;
    constructor(req?: Request) {
        super(req);
        this.DrugMasterBo = BoFactory.GetBo(DrugMasterBo, this.Request);
    }

    public async AddDrugMaster(req: BaseRequest): Promise<number> {
        return await this.DrugMasterBo.AddDrugMaster(req);
    }

    public async UpdateDrugMaster(req: BaseRequest): Promise<boolean> {
        return await this.DrugMasterBo.UpdateDrugMaster(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.DrugMasterBo.GetMaxId(req);
    }

    public async GetDrugLogo(req: BaseRequest): Promise<DrugMasterAttributes> {
        return await this.DrugMasterBo.GetDrugLogo(req);
    }

    public async GetDrugMasterById(req: BaseRequest): Promise<DrugMasterAttributes> {
        return await this.DrugMasterBo.GetDrugMasterById(req);
    }

    public async GetDrugMasters(apiReq?: ApiRequest<DrugMasterFilters>): Promise<ApiResponse<DrugMasterAttributes[]>> {
        return await this.DrugMasterBo.GetDrugMasters(apiReq);
    }

    public async DeleteDrugMaster(req: BaseRequest): Promise<Boolean> {
        return await this.DrugMasterBo.DeleteDrugMaster(req);
    }

    public async MapDiagnosiss(req: BaseRequest): Promise<Boolean> {
        return await this.DrugMasterBo.MapDiagnosiss(req);
    }

    public async GetDiagnosiss(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<DrugDiagnosisMapAttributes>> {
        return await this.DrugMasterBo.GetDiagnosiss(apiReq) as Array<DrugDiagnosisMapAttributes>;
    }

}
