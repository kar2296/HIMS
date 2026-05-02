import {BaseService, BoFactory} from '../../Base/Index';
import { ClinicalRemarkBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ClinicalRemarkAttributes} from '../Model/Interface/Index';
import { ClinicalRemarkFilters } from '../Common/Filters.e';

export class ClinicalRemarkService extends BaseService {
    private ClinicalRemarkBo: ClinicalRemarkBo;
    constructor(req?: Request) {
        super(req);
        this.ClinicalRemarkBo = BoFactory.GetBo(ClinicalRemarkBo, this.Request);
    }

    public async AddClinicalRemark(req: BaseRequest): Promise<number> {
        return await this.ClinicalRemarkBo.AddClinicalRemark(req);
    }

    public async UpdateClinicalRemark(req: BaseRequest): Promise<boolean> {
        return await this.ClinicalRemarkBo.UpdateClinicalRemark(req);
    }

    public async GetClinicalRemarkById(req: BaseRequest): Promise<ClinicalRemarkAttributes> {
        return await this.ClinicalRemarkBo.GetClinicalRemarkById(req);
    }

    public async GetClinicalRemarks(apiReq?: ApiRequest<ClinicalRemarkFilters>): Promise<ApiResponse<ClinicalRemarkAttributes[]>> {
        return await this.ClinicalRemarkBo.GetClinicalRemarks(apiReq);
    }

    public async DeleteClinicalRemark(req: BaseRequest): Promise<Boolean> {
        return await this.ClinicalRemarkBo.DeleteClinicalRemark(req);
    }
}
