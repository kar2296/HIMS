import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ResourceMasterInstance, ResourceMasterAttributes } from '../Model/Interface/Index';
import { ResourceMasterFilters } from '../Common/Filters.e';

export class ResourceMasterBo extends BaseBo<ResourceMasterInstance, ResourceMasterAttributes> implements IOptionProvider {
    public async AddResourceMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateResourceMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetResourceMasterById(req: BaseRequest): Promise<ResourceMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetResourceMasters(apiReq?: ApiRequest<ResourceMasterFilters>): Promise<ApiResponse<ResourceMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('ResourceType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ResourceMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ResourceMasterFilters.Name:
                        (where as any)[Op.or] = [{ [Op.like]: { 'ResourceName': (param.Value || '') + '%' } },
                        { [Op.like]: { 'ResourceCode': (param.Value || '') + '%' } }];
                        break;
                    case ResourceMasterFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ResourceMasterFilters.ResourceType:
                        where['ResourceTypeId'] = param.Value;
                        break;
                    case ResourceMasterFilters.Department:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ResourceMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteResourceMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ResourceMasterInstance, ResourceMasterAttributes> {
        return this.Models.ResourceMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ResourceMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ResourceName', 'Text'], 'ResourceName', 'ResourceCode',
                                                    'DepartmentId', 'FacilityId'];
        let val = await this.GetResourceMasters(apiReq);
        return { [key]: val.Data };
    }
}
