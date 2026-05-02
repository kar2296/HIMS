import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { ServiceCategoryPriorityInstance, ServiceCategoryPriorityAttributes } from '../Model/Interface/Index';

export class ServiceCategoryPriorityBo extends BaseBo<ServiceCategoryPriorityInstance, ServiceCategoryPriorityAttributes>  {
    public async AddServiceCategoryPriority(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceCategoryPriority(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

     public async ManageServiceCategoryPriorities(serviceCategoryId: number,
        details: ServiceCategoryPriorityAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.ServiceCategoryId = serviceCategoryId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetServiceCategoryPriorityById(req: BaseRequest): Promise<ServiceCategoryPriorityAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceCategoryPrioritys(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<ServiceCategoryPriorityAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceCategoryPriority(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceCategoryPriorityInstance, ServiceCategoryPriorityAttributes> {
        return this.Models.ServiceCategoryPriority;
    }

}
