import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceItemAliasInstance, ServiceItemAliasAttributes } from '../Model/Interface/Index';
import { ServiceItemAliasFilters } from '../Common/Filters.e';

export class ServiceItemAliasBo extends BaseBo<ServiceItemAliasInstance, ServiceItemAliasAttributes>  {
    public async AddServiceItemAlias(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceItemAlias(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageSerivceItemAlias(req : BaseRequest): Promise<boolean> {
        let list: ServiceItemAliasAttributes[] = req.Data || [];
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

    public async GetServiceItemAliasById(req: BaseRequest): Promise<ServiceItemAliasAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceItemAliass(apiReq?: ApiRequest<ServiceItemAliasFilters>): Promise<ApiResponse<ServiceItemAliasAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceItemAliasFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceItemAliasFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ServiceItemAliasFilters.ServiceItemId:
                        where['ServiceItemId'] = param.Value;
                        break;
                    case ServiceItemAliasFilters.AliasTypeId: // GuarantorTypeId
                            where['AliasTypeId'] = param.Value;
                            break;
                    case ServiceItemAliasFilters.ExternalProviderId: // GuarantorId
                        where['ExternalProviderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceItemAlias(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceItemAliasInstance, ServiceItemAliasAttributes> {
        return this.Models.ServiceItemAlias;
    }

}
