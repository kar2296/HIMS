import * as SStatic  from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceGroupInstance, ServiceGroupAttributes } from '../Model/Interface/Index';
import { ServiceGroupFilters } from '../Common/Filters.e';

export class ServiceGroupBo extends BaseBo<ServiceGroupInstance, ServiceGroupAttributes> implements IOptionProvider {
    public async AddServiceGroup(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceGroup(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageSerivceGroups(req : BaseRequest): Promise<boolean> {
        let list: ServiceGroupAttributes[] = req.Data || [];
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

    public async GetServiceGroupById(req: BaseRequest): Promise<ServiceGroupAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceGroups(apiReq?: ApiRequest<ServiceGroupFilters>): Promise<ApiResponse<ServiceGroupAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceGroupFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceGroupFilters.Name:
                        (where as any)['$or'] = [{ 'ServiceGroupCode': { '$like': (param.Value || '') + '%' } },
                            { 'ServiceGroupName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ServiceGroupFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ServiceGroupFilters.SourceType:
                        where['SourceTypeId'] = param.Value;
                        break;
                    case ServiceGroupFilters.ActiveStatus:
                        where['StatusId'] = 1;
                        break;
                    case ServiceGroupFilters.InActiveStatus:
                        where['StatusId'] = 0;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceGroup(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ServiceGroupFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ServiceGroupName', 'Text'], 'ServiceGroupName', 'ServiceGroupCode'];
        let val = await this.GetServiceGroups(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ServiceGroupInstance, ServiceGroupAttributes> {
        return this.Models.ServiceGroup;
    }

}
