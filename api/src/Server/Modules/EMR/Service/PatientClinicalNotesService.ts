import { BaseService, BoFactory } from '../../Base/Index';
import { PatientClinicalNotesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientClinicalNotesAttributes } from '../Model/Interface/Index';
import { PatientClinicalNotesFilters } from '../Common/Filters.e';

export class PatientClinicalNotesService extends BaseService {
    private PatientClinicalNotesBo: PatientClinicalNotesBo;
    constructor(req?: Request) {
        super(req);
        this.PatientClinicalNotesBo = BoFactory.GetBo(PatientClinicalNotesBo, this.Request);
    }

    public async AddPatientClinicalNotes(req: BaseRequest): Promise<number> {
        return await this.PatientClinicalNotesBo.AddPatientClinicalNotes(req);
    }

    public async UpdatePatientClinicalNotes(req: BaseRequest): Promise<boolean> {
        return await this.PatientClinicalNotesBo.UpdatePatientClinicalNotes(req);
    }

    public async GetPatientClinicalNotesById(req: BaseRequest): Promise<PatientClinicalNotesAttributes> {
        return await this.PatientClinicalNotesBo.GetPatientClinicalNotesById(req);
    }

    public async GetPatientClinicalNotess(apiReq?: ApiRequest<PatientClinicalNotesFilters>):
        Promise<ApiResponse<PatientClinicalNotesAttributes[]>> {
        return await this.PatientClinicalNotesBo.GetPatientClinicalNotess(apiReq);
    }

    public async SignPatientClinicalNote(req: BaseRequest): Promise<boolean> {
        return await this.PatientClinicalNotesBo.SignPatientClinicalNote(req);
    }

    public async AmendPatientClinicalNote(req: BaseRequest): Promise<number> {
        return await this.PatientClinicalNotesBo.AmendPatientClinicalNote(req);
    }

    public async DeletePatientClinicalNotes(req: BaseRequest): Promise<Boolean> {
        return await this.PatientClinicalNotesBo.DeletePatientClinicalNotes(req);
    }
}
