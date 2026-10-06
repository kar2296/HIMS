import {BaseService, BoFactory } from '../../Base/Index';
import { AssetDocumentBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AssetDocumentAttributes } from '../Model/Interface/Index';
import { AssetDocumentFilters } from '../Common/Filters.e';

export class AssetDocumentService extends BaseService {
    private AssetDocumentBo: AssetDocumentBo;
    constructor(req?: Request) {
        super(req);
        this.AssetDocumentBo = BoFactory.GetBo(AssetDocumentBo, this.Request);
    }

    public async AddAssetDocument(req: BaseRequest): Promise<number> {
        return await this.AssetDocumentBo.AddAssetDocument(req);
    }

    public async UpdateAssetDocument(req: BaseRequest): Promise<boolean> {
        return await this.AssetDocumentBo.UpdateAssetDocument(req);
    }

    public async GetAssetDocumentById(req: BaseRequest): Promise<AssetDocumentAttributes> {
        return await this.AssetDocumentBo.GetAssetDocumentById(req);
    }

    public async GetAssetDocuments(apiReq?: ApiRequest<AssetDocumentFilters>): Promise<ApiResponse<AssetDocumentAttributes[]>> {
        return await this.AssetDocumentBo.GetAssetDocuments(apiReq);
    }

    public async DeleteAssetDocument(req: BaseRequest): Promise<Boolean> {
        return await this.AssetDocumentBo.DeleteAssetDocument(req);
    }
}

