import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ItemContractMapInstance, ItemContractMapAttributes } from '../Model/Interface/Index';
import { ItemContractMapFilters } from '../Common/Filters.e';

export class ItemContractMapBo extends BaseBo<ItemContractMapInstance, ItemContractMapAttributes>  {
   public async AddItemContractMap(req: BaseRequest): Promise<number> {
           let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        // this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemContractMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetItemContractMapById(req: BaseRequest): Promise<ItemContractMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemContractMaps(apiReq?: ApiRequest<ItemContractMapFilters>): Promise<ApiResponse<ItemContractMapAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('YesNo'));
        include.push(this.GetReference('DocumentType'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ItemContractMapFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ItemContractMapFilters.ItemId:
                    where['ItemId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteItemContractMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemContractMapInstance, ItemContractMapAttributes> {
        return this.Models.ItemContractMap;
    }

}
