import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FavoriteMasterInstance, FavoriteMasterAttributes } from '../Model/Interface/Index';
import { FavoriteMasterFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';

export class FavoriteMasterBo extends BaseBo<FavoriteMasterInstance, FavoriteMasterAttributes>  {
    public async AddFavoriteMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.FavoriteMasterDetailBo, this.Request);
        let masterId = result.dataValues.Id;
        await detailBO.ManageDetails(masterId, req.Data.Details);
        return result.dataValues.Id;
    }

    public async UpdateFavoriteMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.FavoriteMasterDetailBo, this.Request);
        let masterId = req.Data.Header.Id;
        await detailBO.ManageDetails(masterId, req.Data.Details);
        return result;
    }

    public async GetFavoriteMasterById(req: BaseRequest): Promise<FavoriteMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFavoriteMasters(apiReq?: ApiRequest<FavoriteMasterFilters>): Promise<ApiResponse<FavoriteMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.FavoriteMasterDetail, required: false });
        include.push(this.GetReference('FavoriteType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AccessibleType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FavoriteMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FavoriteMasterFilters.Name:
                        where['Name'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case FavoriteMasterFilters.FavoriteType:
                        where['FavoriteTypeId'] = param.Value;
                        break;
                    case FavoriteMasterFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case FavoriteMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case FavoriteMasterFilters.User:
                        where['UserId'] = param.Value;
                        break;
                    case FavoriteMasterFilters.AdminFav:
                        (where as any)['$or'] = [{ 'UserId': { '$eq': -1 } },
                                        { 'UserId': { '$eq': null } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFavoriteMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FavoriteMasterInstance, FavoriteMasterAttributes> {
        return this.Models.FavoriteMaster;
    }

}
