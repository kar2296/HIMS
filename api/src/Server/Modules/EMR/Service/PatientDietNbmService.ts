import {BaseService, BoFactory} from '../../Base/Index';
import {PatientDietNbmBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PatientDietNbmAttributes} from '../Model/Interface/Index';
import { PatientDietNbmFilters } from '../Common/Filters.e';

export class PatientDietNbmService extends BaseService {
    private PatientDietNbmBo: PatientDietNbmBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDietNbmBo = BoFactory.GetBo(PatientDietNbmBo, this.Request);
    }

    public async AddPatientDietNbm(req: BaseRequest): Promise<number> {
        return await this.PatientDietNbmBo.AddPatientDietNbm(req);
    }

    public async UpdatePatientDietNbm(req: BaseRequest): Promise<boolean> {
        return await this.PatientDietNbmBo.UpdatePatientDietNbm(req);
    }

    public async GetPatientDietNbmById(req: BaseRequest): Promise<PatientDietNbmAttributes> {
        return await this.PatientDietNbmBo.GetPatientDietNbmById(req);
    }

    public async GetPatientDietNbms(apiReq?: ApiRequest<PatientDietNbmFilters>): Promise<ApiResponse<PatientDietNbmAttributes[]>> {
        return await this.PatientDietNbmBo.GetPatientDietNbms(apiReq);
    }

    public async DeletePatientDietNbm(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDietNbmBo.DeletePatientDietNbm(req);
    }
}
