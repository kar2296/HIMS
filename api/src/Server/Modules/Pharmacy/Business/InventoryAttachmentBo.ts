import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { InventoryAttachmentInstance, InventoryAttachmentAttributes } from '../Model/Interface/Index';
import { InventoryAttachmentFilters } from '../Common/Filters.e';

export class InventoryAttachmentBo extends BaseBo<InventoryAttachmentInstance, InventoryAttachmentAttributes>  {
    public async AddInventoryAttachment(req: BaseRequest): Promise<number> {
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

    public async UpdateInventoryAttachment(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAttachmentFile(req: BaseRequest, res: any): Promise<any> {
        let result = await res.download(req.Data.FilePath);
        return result;
    }

    public async GetInventoryAttachmentById(req: BaseRequest): Promise<InventoryAttachmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetInventoryAttachments(apiReq?: ApiRequest<InventoryAttachmentFilters>):
        Promise<ApiResponse<InventoryAttachmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case InventoryAttachmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case InventoryAttachmentFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case InventoryAttachmentFilters.ObjectTypeId:
                        where['ObjectTypeId'] = param.Value;
                        break;
                    case InventoryAttachmentFilters.AttachmentTypeId:
                        where['AttachmentTypeId'] = param.Value;
                        break;
                    case InventoryAttachmentFilters.ItemId:
                        where['ItemId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteInventoryAttachment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<InventoryAttachmentInstance, InventoryAttachmentAttributes> {
        return this.Models.InventoryAttachment;
    }

}
