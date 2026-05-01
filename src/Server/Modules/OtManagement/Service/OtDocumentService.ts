import {BaseService, BoFactory } from '../../Base/Index';
import { OtDocumentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { OtDocumentAttributes } from '../Model/Interface/Index';
import { OtDocumentFilters } from '../Common/Filters.e';

export class OtDocumentService extends BaseService {
    private OtDocumentBo: OtDocumentBo;
    constructor(req?: Request) {
        super(req);
        this.OtDocumentBo = BoFactory.GetBo(OtDocumentBo, this.Request);
    }

    public async AddOtDocument(req: BaseRequest): Promise<number> {
        return await this.OtDocumentBo.AddOtDocument(req);
    }

    public async UpdateOtDocument(req: BaseRequest): Promise<boolean> {
        return await this.OtDocumentBo.UpdateOtDocument(req);
    }

    public async GetOtDocumentById(req: BaseRequest): Promise<OtDocumentAttributes> {
        return await this.OtDocumentBo.GetOtDocumentById(req);
    }

    public async GetOtDocuments(apiReq?: ApiRequest<OtDocumentFilters>): Promise<ApiResponse<OtDocumentAttributes[]>> {
        return await this.OtDocumentBo.GetOtDocuments(apiReq);
    }

    public async printOtDocuments(req: BaseRequest): Promise<FileInfo> {
        return await this.OtDocumentBo.printOtDocuments(req);
    }

    public async DeleteOtDocument(req: BaseRequest): Promise<Boolean> {
        return await this.OtDocumentBo.DeleteOtDocument(req);
    }
}

