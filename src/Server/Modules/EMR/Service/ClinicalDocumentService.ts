import { BaseService, BoFactory } from '../../Base/Index';
import { ClinicalDocumentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ClinicalDocumentAttributes } from '../Model/Interface/Index';
import { ClinicalDocumentFilters } from '../Common/Filters.e';

export class ClinicalDocumentService extends BaseService {
    private ClinicalDocumentBo: ClinicalDocumentBo;
    constructor(req?: Request) {
        super(req);
        this.ClinicalDocumentBo = BoFactory.GetBo(ClinicalDocumentBo, this.Request);
    }

    public async AddClinicalDocument(req: BaseRequest): Promise<number> {
        return await this.ClinicalDocumentBo.AddClinicalDocument(req);
    }

    public async AddMultipleDocument(req: BaseRequest): Promise<number> {
        return await this.ClinicalDocumentBo.AddMultipleDocument(req);
    }

    public async UpdateClinicalDocument(req: BaseRequest): Promise<boolean> {
        return await this.ClinicalDocumentBo.UpdateClinicalDocument(req);
    }

    public async GetClinicalDocumentById(req: BaseRequest): Promise<ClinicalDocumentAttributes> {
        return await this.ClinicalDocumentBo.GetClinicalDocumentById(req);
    }

    public async GetClinicalDocuments(apiReq?: ApiRequest<ClinicalDocumentFilters>): Promise<ApiResponse<ClinicalDocumentAttributes[]>> {
        return await this.ClinicalDocumentBo.GetClinicalDocuments(apiReq);
    }

    public async GetAttachmentFile(apiReq?: ApiRequest<ClinicalDocumentFilters>): Promise<ApiResponse<ClinicalDocumentAttributes[]>> {
        return await this.ClinicalDocumentBo.GetAttachmentFile(apiReq);
    }

    public async DeleteClinicalDocument(req: BaseRequest): Promise<Boolean> {
        return await this.ClinicalDocumentBo.DeleteClinicalDocument(req);
    }
}
