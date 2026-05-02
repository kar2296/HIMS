import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProfileSectionInstance, ProfileSectionAttributes } from '../Model/Interface/Index';
import { ProfileSectionFilters } from '../Common/Filters.e';
import * as _ from 'lodash';

export class ProfileSectionBo extends BaseBo<ProfileSectionInstance, ProfileSectionAttributes>  {
    public async AddProfileSection(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProfileSection(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public objectComparer(current: any, other: any): boolean {
        return current.ProfileId === other.ProfileId && current.SectionId === other.SectionId
            && current.DockPositionId === other.DockPositionId && current.DisplayOrder === other.DisplayOrder;
    }

    public async ManageProfileSection(req: BaseRequest): Promise<boolean> {
        let modified: any = req.Data || [];
        let existing: any = [];
        let promises: Array<any> = [];

        let response = await this.FindAll({
            where: {
                ProfileId: req.Id
            }
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            existing.push(attribs);
        });

        let toAdd: ProfileSectionAttributes[] = _.differenceWith(modified, existing, this.objectComparer);
        let toDelete: ProfileSectionAttributes[] = _.differenceWith(existing, modified, this.objectComparer);
        let toUpdate: ProfileSectionAttributes[] = _.intersectionWith(existing, modified, this.objectComparer);

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

    public async GetProfileSectionById(req: BaseRequest): Promise<ProfileSectionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProfileSections(apiReq?: ApiRequest<ProfileSectionFilters>): Promise<ApiResponse<ProfileSectionAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.ProfileMaster, attributes: ['Name'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProfileSectionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProfileSectionFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProfileSectionFilters.ProfileId:
                        where['ProfileId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteProfileSection(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProfileSectionInstance, ProfileSectionAttributes> {
        return this.Models.ProfileSection;
    }

}
