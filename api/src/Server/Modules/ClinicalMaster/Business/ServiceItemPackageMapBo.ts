import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceItemPackageMapInstance, ServiceItemPackageMapAttributes } from '../Model/Interface/Index';
import { ServiceItemPackageMapFilters } from '../Common/Filters.e';

export class ServiceItemPackageMapBo extends BaseBo<ServiceItemPackageMapInstance, ServiceItemPackageMapAttributes>  {
    public async AddServiceItemPackageMap(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceItemPackageMap(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageSerivceItemPackageMap(req : BaseRequest): Promise<boolean> {
        let list: ServiceItemPackageMapAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetServiceItemPackageMapById(req: BaseRequest): Promise<ServiceItemPackageMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceItemPackageMaps(apiReq?: ApiRequest<ServiceItemPackageMapFilters>):
     Promise<ApiResponse<ServiceItemPackageMapAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceItemPackageMapFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceItemPackageMapFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ServiceItemPackageMapFilters.ServiceItemId:
                        where['ServiceItemId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceItemPackageMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceItemPackageMapInstance, ServiceItemPackageMapAttributes> {
        return this.Models.ServiceItemPackageMap;
    }

}
