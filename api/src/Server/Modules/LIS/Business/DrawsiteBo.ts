import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { DrawsiteInstance, DrawsiteAttributes } from '../Model/Interface/Index';
//import { DrawsiteFilters } from '../Common/Filters.e';

export class DrawsiteBo extends BaseBo<DrawsiteInstance, DrawsiteAttributes>  {
    public async AddDrawsite(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDrawsite(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDrawsiteById(req: BaseRequest): Promise<DrawsiteAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDrawsites(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<DrawsiteAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDrawsite(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DrawsiteInstance, DrawsiteAttributes> {
        return this.Models.Drawsite;
    }

}
