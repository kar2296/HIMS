import { BaseService, BoFactory } from '../../Base/Index';
import { ExaminationMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ExaminationMasterAttributes } from '../Model/Interface/Index';
import { ExaminationMasterFilters } from '../Common/Filters.e';

export class ExaminationMasterService extends BaseService {
    private ExaminationMasterBo: ExaminationMasterBo;
    constructor(req?: Request) {
        super(req);
        this.ExaminationMasterBo = BoFactory.GetBo(ExaminationMasterBo, this.Request);
    }

    public async AddExaminationMaster(req: BaseRequest): Promise<number> {
        return await this.ExaminationMasterBo.AddExaminationMaster(req);
    }

    public async UpdateExaminationMaster(req: BaseRequest): Promise<boolean> {
        return await this.ExaminationMasterBo.UpdateExaminationMaster(req);
    }

    public async GetExaminationMasterById(req: BaseRequest): Promise<ExaminationMasterAttributes> {
        return await this.ExaminationMasterBo.GetExaminationMasterById(req);
    }

    public async GetExaminationMasters(apiReq?: ApiRequest<ExaminationMasterFilters>):
        Promise<ApiResponse<ExaminationMasterAttributes[]>> {
        return await this.ExaminationMasterBo.GetExaminationMasters(apiReq);
    }

    public async DeleteExaminationMaster(req: BaseRequest): Promise<Boolean> {
        return await this.ExaminationMasterBo.DeleteExaminationMaster(req);
    }
}
