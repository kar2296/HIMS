import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { RolePrivilegeInstance, RolePrivilegeAttributes } from '../Model/Interface/Index';
import { RolePrivilegeFilters } from '../Common/Filters.e';
import * as _ from 'lodash';

export class RolePrivilegeBo extends BaseBo<RolePrivilegeInstance, RolePrivilegeAttributes>  {
    public async AddRolePrivilege(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRolePrivilege(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public objectComparer(current: any, other: any): boolean {
        return current.RoleId === other.RoleId && current.AccessObjectTypeId === other.AccessObjectTypeId
            && current.AccessActionId === other.AccessActionId && current.Access === other.Access;
    }

    public async ManageRolePrivilege(req: BaseRequest): Promise<boolean> {
        let modified: any = req.Data || [];
        let existing: any = [];
        let promises: Array<any> = [];

        let response = await this.FindAll({
            where: {
                RoleId: req.Id,
                AccessObjectTypeId: req.Data[0].AccessObjectTypeId
            }
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            existing.push(attribs);
        });

        let toAdd: RolePrivilegeAttributes[] = _.differenceWith(modified, existing, this.objectComparer);
        let toDelete: RolePrivilegeAttributes[] = _.differenceWith(existing, modified, this.objectComparer);
        let toUpdate: RolePrivilegeAttributes[] = _.intersectionWith(existing, modified, this.objectComparer);

        //console.log(toAdd);
        //console.log(toDelete);
        //console.log(toUpdate);

        toAdd.forEach(item => {
            item.Id = 0;
            promises.push(this.Save(item));
        });
        toDelete.forEach(item => {
            promises.push(this.DeleteById(item));
        });
        toUpdate.forEach(item => {
            promises.push(this.Update(item));
        });

        await Promise.all(promises);
        return true;
    }

    public async GetRolePrivilegeById(req: BaseRequest): Promise<RolePrivilegeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRolePrivileges(apiReq?: ApiRequest<RolePrivilegeFilters>): Promise<ApiResponse<RolePrivilegeAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RolePrivilegeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RolePrivilegeFilters.RoleId:
                        where['RoleId'] = param.Value;
                        break;
                    case RolePrivilegeFilters.RoleCode:
                        where['RoleCode'] = param.Value;
                        break;
                    case RolePrivilegeFilters.AccessObjectTypeId:
                        where['AccessObjectTypeId'] = param.Value;
                        break;
                    case RolePrivilegeFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteRolePrivilege(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<RolePrivilegeInstance, RolePrivilegeAttributes> {
        return this.Models.RolePrivilege;
    }

}
