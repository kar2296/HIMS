import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { WardUserMapInstance, WardUserMapAttributes } from '../Model/Interface/Index';
import { WardUserMapFilters } from '../Common/Filters.e';

export class WardUserMapBo extends BaseBo<WardUserMapInstance, WardUserMapAttributes> {
    public async AddWardUserMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWardUserMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetWardUserMapById(req: BaseRequest): Promise<WardUserMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWardUserMaps(apiReq?: ApiRequest<WardUserMapFilters>): Promise<ApiResponse<WardUserMapAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let WardWhere: WhereOptions<any>= {};
        let IsWardSearch: boolean = false;
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('UserType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardUserMapFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardUserMapFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case WardUserMapFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case WardUserMapFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case WardUserMapFilters.UserTypeId:
                        where['UserTypeId'] = param.Value;
                        break;
                    case WardUserMapFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case WardUserMapFilters.WardType:
                        WardWhere['WardTypeId'] = { '$in': param.Value };
                        IsWardSearch = true;
                        break;
                    case WardUserMapFilters.WardMasterTypeId:
                        WardWhere['WardMasterTypeId'] = param.Value;
                        IsWardSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let WardQry: any = {
            model: this.Models.WardMaster,
            attributes: ['Id','WardName'],
            where: WardWhere,
            required: IsWardSearch
        };
        include.push(WardQry);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWardUserMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<WardUserMapFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || [['WardId', 'Id'], 'WardId',['WardName', 'Text'], 'WardName'];
        let val = await this.GetWardUserMaps(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<WardUserMapInstance, WardUserMapAttributes> {
        return this.Models.WardUserMap;
    }
}
