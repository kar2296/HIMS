import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import {WhereOptions, IncludeOptions} from '../../../Core/Index';
import {ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OrganizationInstance, OrganizationAttributes} from '../Model/Interface/Index';
import { OrganizationFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class OrganizationBo extends BaseBo<OrganizationInstance, OrganizationAttributes> implements IOptionProvider {
    public async AddOrganization(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOrganization(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOrganizationLogo(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.LogoPath);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return {Id : req.Data.Id, Logo : logoBase64 };
    }

    public async GetOrganizationById(req: BaseRequest): Promise<OrganizationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOrganizations(apiReq?: ApiRequest<OrganizationFilters>): Promise<ApiResponse<OrganizationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OrganizationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OrganizationFilters.Name:
                        where['OrgName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case OrganizationFilters.Code:
                        where['OrgCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case OrganizationFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteOrganization(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OrganizationInstance, OrganizationAttributes> {
        return this.Models.Organization;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OrganizationFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['OrgName', 'Text'], 'OrgCode'];
        let val = await this.GetOrganizations(apiReq);
        return { [key]: val.Data };
    }
}
