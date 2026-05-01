import {BaseService, BoFactory} from '../../Base/Index';
import { PatientBillLockBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientBillLockAttributes} from '../Model/Interface/Index';
import { PatientBillLockFilters } from '../Common/Filters.e';

export class PatientBillLockService extends BaseService {
    private PatientBillLockBo: PatientBillLockBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBillLockBo = BoFactory.GetBo(PatientBillLockBo, this.Request);
    }

    public async AddPatientBillLock(req: BaseRequest): Promise<number> {
        return await this.PatientBillLockBo.AddPatientBillLock(req);
    }

    public async UpdatePatientBillLock(req: BaseRequest): Promise<boolean> {
        return await this.PatientBillLockBo.UpdatePatientBillLock(req);
    }

    public async GetPatientBillLockById(req: BaseRequest): Promise<PatientBillLockAttributes> {
        return await this.PatientBillLockBo.GetPatientBillLockById(req);
    }

    public async GetPatientBillLocks(apiReq?: ApiRequest<PatientBillLockFilters>): Promise<ApiResponse<PatientBillLockAttributes[]>> {
        return await this.PatientBillLockBo.GetPatientBillLocks(apiReq);
    }

    public async DeletePatientBillLock(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBillLockBo.DeletePatientBillLock(req);
    }

    public async GetPatientBillLockByEncounterId(req: BaseRequest): Promise<PatientBillLockAttributes> {
        return await this.PatientBillLockBo.GetPatientBillLockByEncounterId(req);
    }
}
