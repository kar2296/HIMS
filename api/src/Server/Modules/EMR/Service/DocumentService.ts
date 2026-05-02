import {BaseService, BoFactory} from '../../Base/Index';
import { DocumentBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DocumentAttributes} from '../Model/Interface/Index';
import { DocumentFilters } from '../Common/Filters.e';

export class DocumentService extends BaseService {
    private DocumentBo: DocumentBo;
    constructor(req?: Request) {
        super(req);
        this.DocumentBo = BoFactory.GetBo(DocumentBo, this.Request);
    }

    public async AddDocument(req: BaseRequest): Promise<number> {
        return await this.DocumentBo.AddDocument(req);
    }

    public async UpdateDocument(req: BaseRequest): Promise<boolean> {
        return await this.DocumentBo.UpdateDocument(req);
    }

    public async GetDocumentById(req: BaseRequest): Promise<DocumentAttributes> {
        return await this.DocumentBo.GetDocumentById(req);
    }

    public async GetDocuments(apiReq?: ApiRequest<DocumentFilters>): Promise<ApiResponse<DocumentAttributes[]>> {
        return await this.DocumentBo.GetDocuments(apiReq);
    }

    public async DeleteDocument(req: BaseRequest): Promise<Boolean> {
        return await this.DocumentBo.DeleteDocument(req);
    }
}
