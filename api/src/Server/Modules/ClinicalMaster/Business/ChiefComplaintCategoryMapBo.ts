import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ChiefComplaintCategoryMapInstance, ChiefComplaintCategoryMapAttributes } from '../Model/Interface/Index';
import { ChiefComplaintCategoryMapFilters } from '../Common/Filters.e';

export class ChiefComplaintCategoryMapBo extends BaseBo<ChiefComplaintCategoryMapInstance, ChiefComplaintCategoryMapAttributes>  {
    public async AddChiefComplaintCategoryMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateChiefComplaintCategoryMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetChiefComplaintCategoryMapById(req: BaseRequest): Promise<ChiefComplaintCategoryMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageMaps(details: any[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                //detail.ActiveStatusId = 2;
                await this.Save(detail);
            })(DetailItem);
        }));
        return true;
    }

    public async GetChiefComplaintCategoryMaps(apiReq?: ApiRequest<ChiefComplaintCategoryMapFilters>):
        Promise<ApiResponse<ChiefComplaintCategoryMapAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ChiefComplaint, attributes: ['ChiefComplaint'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ChiefComplaintCategoryMapFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ChiefComplaintCategoryMapFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ChiefComplaintCategoryMapFilters.ChiefComplaintIds:
                        where['ChiefComplaintId'] = { '$in': param.Value };
                        break;
                    case ChiefComplaintCategoryMapFilters.CategoryId:
                        where['CategoryId'] =  param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteChiefComplaintCategoryMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ChiefComplaintCategoryMapInstance, ChiefComplaintCategoryMapAttributes> {
        return this.Models.ChiefComplaintCategoryMap;
    }

}
