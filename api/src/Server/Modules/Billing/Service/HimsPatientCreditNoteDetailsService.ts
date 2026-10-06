import { BaseService, BoFactory } from '../../Base/Index';
import { PatientCreditNoteDetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientCreditNoteDetailsAttributes } from '../Model/Interface/Index';
import { PatientCreditNoteDetailsFilters } from '../Common/Filters.e';

export class PatientCreditNoteDetailsService extends BaseService {
    private PatientCreditNoteDetailsBo: PatientCreditNoteDetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientCreditNoteDetailsBo = BoFactory.GetBo(PatientCreditNoteDetailsBo, this.Request);
    }

    public async AddPatientCreditNoteDetails(req: BaseRequest): Promise<number> {
        return await this.PatientCreditNoteDetailsBo.AddPatientCreditNoteDetails(req);
    }

    public async UpdatePatientCreditNoteDetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientCreditNoteDetailsBo.UpdatePatientCreditNoteDetails(req);
    }

    public async GetPatientCreditNoteDetailsById(req: BaseRequest): Promise<PatientCreditNoteDetailsAttributes> {
        return await this.PatientCreditNoteDetailsBo.GetPatientCreditNoteDetailsById(req);
    }

    public async GetPatientCreditNoteDetails(apiReq?: ApiRequest<PatientCreditNoteDetailsFilters>)
        : Promise<ApiResponse<PatientCreditNoteDetailsAttributes[]>> {
        return await this.PatientCreditNoteDetailsBo.GetPatientCreditNoteDetails(apiReq);
    }

    public async DeletePatientCreditNoteDetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientCreditNoteDetailsBo.DeletePatientCreditNoteDetails(req);
    }
}
