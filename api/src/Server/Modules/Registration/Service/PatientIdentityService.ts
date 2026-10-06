import {BaseService, BoFactory} from '../../Base/Index';
import { PatientIdentityBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientIdentityAttributes} from '../Model/Interface/Index';
import { PatientIdentityFilters } from '../Common/Filters.e';

export class PatientIdentityService extends BaseService {
    private PatientIdentityBo: PatientIdentityBo;
    constructor(req?: Request) {
        super(req);
        this.PatientIdentityBo = BoFactory.GetBo(PatientIdentityBo, this.Request);
    }

    public async AddPatientIdentity(req: BaseRequest): Promise<number> {
        return await this.PatientIdentityBo.AddPatientIdentity(req);
    }

    public async UpdatePatientIdentity(req: BaseRequest): Promise<boolean> {
        return await this.PatientIdentityBo.UpdatePatientIdentity(req);
    }

    public async ManagePatientIdentities(req: BaseRequest): Promise<boolean> {
        return await this.PatientIdentityBo.ManagePatientIdentities(req);
    }

    public async GetPatientIdDocs(req: BaseRequest): Promise<PatientIdentityAttributes> {
        return await this.PatientIdentityBo.GetPatientIdDocs(req);
    }

    public async GetPatientIdentityById(req: BaseRequest): Promise<PatientIdentityAttributes> {
        return await this.PatientIdentityBo.GetPatientIdentityById(req);
    }

    public async GetPatientIdentitys(apiReq?: ApiRequest<PatientIdentityFilters>): Promise<Array<PatientIdentityAttributes>> {
        return await this.PatientIdentityBo.GetPatientIdentitys(apiReq);
    }

    public async DeletePatientIdentity(req: BaseRequest): Promise<Boolean> {
        return await this.PatientIdentityBo.DeletePatientIdentity(req);
    }
}
