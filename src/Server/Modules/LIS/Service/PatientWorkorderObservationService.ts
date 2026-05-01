import { BaseService, BoFactory } from '../../Base/Index';
import { PatientWorkorderObservationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientWorkorderObservationAttributes } from '../Model/Interface/Index';

export class PatientWorkorderObservationService extends BaseService {
    private PatientWorkorderObservationBo: PatientWorkorderObservationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientWorkorderObservationBo = BoFactory.GetBo(PatientWorkorderObservationBo, this.Request);
    }

    public async AddPatientWorkorderObservation(req: BaseRequest): Promise<number> {
        return await this.PatientWorkorderObservationBo.AddPatientWorkorderObservation(req);
    }

    public async UpdatePatientWorkorderObservation(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderObservationBo.UpdatePatientWorkorderObservation(req);
    }

    public async GetPatientWorkorderObservationById(req: BaseRequest): Promise<PatientWorkorderObservationAttributes> {
        return await this.PatientWorkorderObservationBo.GetPatientWorkorderObservationById(req);
    }

    public async GetPatientWorkorderObservations
        (apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PatientWorkorderObservationAttributes[]>> {
        return await this.PatientWorkorderObservationBo.GetPatientWorkorderObservations(apiReq);
    }

    public async DeletePatientWorkorderObservation(req: BaseRequest): Promise<Boolean> {
        return await this.PatientWorkorderObservationBo.DeletePatientWorkorderObservation(req);
    }
}
