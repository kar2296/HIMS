import {BaseService, BoFactory } from '../../Base/Index';
import { PatientAttachmentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, Response } from '../../../Core/Index';
import { PatientAttachmentAttributes } from '../Model/Interface/Index';
import { PatientAttachmentFilters } from '../Common/Filters.e';

export class PatientAttachmentService extends BaseService {
    private PatientAttachmentBo: PatientAttachmentBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAttachmentBo = BoFactory.GetBo(PatientAttachmentBo, this.Request);
    }
    public async AddPatientAttachment(req: BaseRequest): Promise<number> {
        return await this.PatientAttachmentBo.AddPatientAttachment(req);
    }

    public async UpdatePatientAttachment(req: BaseRequest): Promise<boolean> {
        return await this.PatientAttachmentBo.UpdatePatientAttachment(req);
    }

    public async GetAttachmentFile(req: BaseRequest, res : Response): Promise<any> {
        return await this.PatientAttachmentBo.GetAttachmentFile(req, res);
    }

    public async GetPatientAttachmentById(req: BaseRequest): Promise<PatientAttachmentAttributes> {
        return await this.PatientAttachmentBo.GetPatientAttachmentById(req);
    }

    public async GetPatientAttachments(apiReq?: ApiRequest<PatientAttachmentFilters>): Promise<ApiResponse<PatientAttachmentAttributes[]>> {
        return await this.PatientAttachmentBo.GetPatientAttachments(apiReq);
    }

    public async DeletePatientAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAttachmentBo.DeletePatientAttachment(req);
    }
}
