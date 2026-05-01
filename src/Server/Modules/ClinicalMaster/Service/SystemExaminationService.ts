import {BaseService, BoFactory} from '../../Base/Index';
import { SystemExaminationBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { SystemExaminationAttributes} from '../Model/Interface/Index';
import { SystemExaminationFilters } from '../Common/Filters.e';

export class SystemExaminationService extends BaseService {
    private SystemExaminationBo: SystemExaminationBo;
    constructor(req?: Request) {
        super(req);
        this.SystemExaminationBo = BoFactory.GetBo(SystemExaminationBo, this.Request);
    }

    public async AddSystemExamination(req: BaseRequest): Promise<number> {
        return await this.SystemExaminationBo.AddSystemExamination(req);
    }

    public async UpdateSystemExamination(req: BaseRequest): Promise<boolean> {
        return await this.SystemExaminationBo.UpdateSystemExamination(req);
    }

    public async GetSystemExaminationById(req: BaseRequest): Promise<SystemExaminationAttributes> {
        return await this.SystemExaminationBo.GetSystemExaminationById(req);
    }

    public async GetSystemExaminations(apiReq?: ApiRequest<SystemExaminationFilters>): Promise<ApiResponse<SystemExaminationAttributes[]>> {
        return await this.SystemExaminationBo.GetSystemExaminations(apiReq);
    }

    public async DeleteSystemExamination(req: BaseRequest): Promise<Boolean> {
        return await this.SystemExaminationBo.DeleteSystemExamination(req);
    }
}
