import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProfileUserInstance, ProfileUserAttributes } from '../Model/Interface/Index';
import { ProfileUserFilters } from '../Common/Filters.e';

export class ProfileUserBo extends BaseBo<ProfileUserInstance, ProfileUserAttributes>  {
    public async AddProfileUser(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProfileUser(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProfileUserById(req: BaseRequest): Promise<ProfileUserAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProfileUsers(apiReq?: ApiRequest<ProfileUserFilters>): Promise<ApiResponse<ProfileUserAttributes[]>> {
        let where: WhereOptions<any> = {};
        let profileWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('VisitType'));

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProfileUserFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProfileUserFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProfileUserFilters.ProfileId:
                        where['ProfileId'] = param.Value;
                        break;
                    case ProfileUserFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ProfileUserFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ProfileUserFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case ProfileUserFilters.VisitTypeId:
                        where['VisitTypeId'] = param.Value;
                        break;
                    case ProfileUserFilters.DefaultProfile:
                        (where as any)['$or'] = [{ 'UserId': { '$eq': -1 } },
                        { 'UserId': { '$eq': null } }];
                        break;
                    case ProfileUserFilters.IsDefault:
                        where['IsDefault'] = param.Value;
                        break;
                    case ProfileUserFilters.ProfileType:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            profileWhere['ProfilemasterTypeId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({ model: this.Models.ProfileMaster,
            where: profileWhere,
            required: false });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteProfileUser(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProfileUserInstance, ProfileUserAttributes> {
        return this.Models.ProfileUser;
    }

}
