import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FavoriteMasterDetailInstance, FavoriteMasterDetailAttributes } from '../Model/Interface/Index';
import { FavoriteMasterDetailFilters } from '../Common/Filters.e';

export class FavoriteMasterDetailBo extends BaseBo<FavoriteMasterDetailInstance, FavoriteMasterDetailAttributes>  {
    public async AddFavoriteMasterDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFavoriteMasterDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageDetails(masterId: number, details: FavoriteMasterDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.FavoriteMasterId = masterId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetFavoriteMasterDetailById(req: BaseRequest): Promise<FavoriteMasterDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFavoriteMasterDetails(apiReq?: ApiRequest<FavoriteMasterDetailFilters>):
     Promise<ApiResponse<FavoriteMasterDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case FavoriteMasterDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case FavoriteMasterDetailFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case FavoriteMasterDetailFilters.FavoriteMasterId:
                    where['FavoriteMasterId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFavoriteMasterDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FavoriteMasterDetailInstance, FavoriteMasterDetailAttributes> {
        return this.Models.FavoriteMasterDetail;
    }

}
