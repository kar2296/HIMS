import {BaseService, BoFactory } from '../../Base/Index';
import { PatientAnnotationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAnnotationAttributes } from '../Model/Interface/Index';
import { PatientAnnotationFilters } from '../Common/Filters.e';

export class PatientAnnotationService extends BaseService {
    private PatientAnnotationBo: PatientAnnotationBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAnnotationBo = BoFactory.GetBo(PatientAnnotationBo, this.Request);
    }

    public async AddPatientAnnotation(req: BaseRequest): Promise<number> {
        return await this.PatientAnnotationBo.AddPatientAnnotation(req);
    }

    public async UpdatePatientAnnotation(req: BaseRequest): Promise<boolean> {
        return await this.PatientAnnotationBo.UpdatePatientAnnotation(req);
    }

    public async GetAnnotationFile(req: BaseRequest): Promise<PatientAnnotationAttributes> {
        return await this.PatientAnnotationBo.GetAnnotationFile(req);
    }

    public async GetPatientAnnotationById(req: BaseRequest): Promise<PatientAnnotationAttributes> {
        return await this.PatientAnnotationBo.GetPatientAnnotationById(req);
    }

    public async GetPatientAnnotations(apiReq?: ApiRequest<PatientAnnotationFilters>): Promise<ApiResponse<PatientAnnotationAttributes[]>> {
        return await this.PatientAnnotationBo.GetPatientAnnotations(apiReq);
    }

    public async DeletePatientAnnotation(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAnnotationBo.DeletePatientAnnotation(req);
    }
}
