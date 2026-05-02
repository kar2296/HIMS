import { BaseService, BoFactory } from '../../Base/Index';
import { PatientCreditNoteBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientCreditNoteAttributes } from '../Model/Interface/Index';
import { PatientCreditNoteFilters } from '../Common/Filters.e';

export class PatientCreditNoteService extends BaseService {
    private PatientCreditNoteBo: PatientCreditNoteBo;
    constructor(req?: Request) {
        super(req);
        this.PatientCreditNoteBo = BoFactory.GetBo(PatientCreditNoteBo, this.Request);
    }

    public async AddPatientCreditNote(req: BaseRequest): Promise<number> {
        return await this.PatientCreditNoteBo.AddPatientCreditNote(req);
    }

    public async UpdatePatientCreditNote(req: BaseRequest): Promise<boolean> {
        return await this.PatientCreditNoteBo.UpdatePatientCreditNote(req);
    }

    public async GetPatientCreditNoteById(req: BaseRequest): Promise<PatientCreditNoteAttributes> {
        return await this.PatientCreditNoteBo.GetPatientCreditNoteById(req);
    }

    public async GetPatientCreditNotes(apiReq?: ApiRequest<PatientCreditNoteFilters>): Promise<ApiResponse<PatientCreditNoteAttributes[]>> {
        return await this.PatientCreditNoteBo.GetPatientCreditNotes(apiReq);
    }

    public async DeletePatientCreditNote(req: BaseRequest): Promise<Boolean> {
        return await this.PatientCreditNoteBo.DeletePatientCreditNote(req);
    }
    public async PrintPatientCreditNote(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientCreditNoteBo.PrintPatientCreditNote(req);
    }
}
