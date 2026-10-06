import {BaseService, BoFactory} from '../../Base/Index';
import { PatientKinBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientKinAttributes} from '../Model/Interface/Index';
import { PatientKinFilters } from '../Common/Filters.e';

export class PatientKinService extends BaseService {
    private PatientKinBo: PatientKinBo;
    constructor(req?: Request) {
        super(req);
        this.PatientKinBo = BoFactory.GetBo(PatientKinBo, this.Request);
    }

    public async AddPatientKin(req: BaseRequest): Promise<number> {
        return await this.PatientKinBo.AddPatientKin(req);
    }

    public async UpdatePatientKin(req: BaseRequest): Promise<boolean> {
        return await this.PatientKinBo.UpdatePatientKin(req);
    }

    public async GetPatientKinById(req: BaseRequest): Promise<PatientKinAttributes> {
        return await this.PatientKinBo.GetPatientKinById(req);
    }

    public async GetPatientKins(apiReq?: ApiRequest<PatientKinFilters>): Promise<Array<PatientKinAttributes>> {
        return await this.PatientKinBo.GetPatientKins(apiReq);
    }

    public async DeletePatientKin(req: BaseRequest): Promise<Boolean> {
        return await this.PatientKinBo.DeletePatientKin(req);
    }
}
