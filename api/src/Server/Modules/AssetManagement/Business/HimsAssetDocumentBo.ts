import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AssetDocumentInstance, AssetDocumentAttributes } from '../Model/Interface/Index';
import { AssetDocumentFilters } from '../Common/Filters.e';

export class AssetDocumentBo extends BaseBo<AssetDocumentInstance, AssetDocumentAttributes>  {
    public async AddAssetDocument(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetDocument(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAssetDocumentById(req: BaseRequest): Promise<AssetDocumentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetDocuments(apiReq?: ApiRequest<AssetDocumentFilters>): Promise<ApiResponse<AssetDocumentAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('YesNo'));
        include.push(this.GetReference('DocumentType'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case AssetDocumentFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case AssetDocumentFilters.AssetId:
                    where['AssetId'] = param.Value;
                    break;
				case AssetDocumentFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssetDocument(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AssetDocumentInstance, AssetDocumentAttributes> {
        return this.Models.AssetDocument;
    }

}
