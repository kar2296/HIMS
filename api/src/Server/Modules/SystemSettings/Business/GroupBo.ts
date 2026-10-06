import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { GroupInstance, GroupAttributes } from '../Model/Interface/Index';
import { GroupFilters } from '../Common/Filters.e';

export class GroupBo extends BaseBo<GroupInstance, GroupAttributes> implements IOptionProvider {
    public async AddGroup(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGroup(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGroupById(req: BaseRequest): Promise<GroupAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGroups(apiReq?: ApiRequest<GroupFilters>): Promise<ApiResponse<GroupAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Facility, as: 'Facility', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GroupFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GroupFilters.Name:
                        where['GroupName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case GroupFilters.GroupCode:
                        where['GroupCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case GroupFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case GroupFilters.eqGrpCode:
                        where['GroupCode'] = param.Value;
                        break;
                    case GroupFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteGroup(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GroupInstance, GroupAttributes> {
        return this.Models.Group;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GroupFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['GroupName', 'Text'], 'GroupCode', 'GroupName'];
        let val = await this.GetGroups(apiReq);
        return { [key]: val.Data };
    }

    public async MapFacilities(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.GroupFacilityMap as any, 'GroupId', 'FacilityId', this.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.GroupFacilityMap as any, 'GroupId', 'FacilityId', this.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async MapRoles(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.GroupRoleMap as any, 'GroupId', 'RoleId', this.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetRoles(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.GroupRoleMap as any, 'GroupId', 'RoleId', this.Request);
        return await mapbo.GetMaps(apiReq);
    }
}
