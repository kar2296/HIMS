import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TemplateMasterDetailInstance, TemplateMasterDetailAttributes } from '../Model/Interface/Index';
import { TemplateMasterDetailFilters } from '../Common/Filters.e';

export class TemplateMasterDetailBo extends BaseBo<TemplateMasterDetailInstance, TemplateMasterDetailAttributes>  {
    public async AddTemplateMasterDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTemplateMasterDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageDetails(masterId: number, details: TemplateMasterDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.TemplateMasterId = masterId;
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

    public async GetTemplateMasterDetailById(req: BaseRequest): Promise<TemplateMasterDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTemplateMasterDetails(apiReq?: ApiRequest<TemplateMasterDetailFilters>):
     Promise<ApiResponse<TemplateMasterDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case TemplateMasterDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case TemplateMasterDetailFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case TemplateMasterDetailFilters.TemplateMasterId:
                    where['TemplateMasterId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTemplateMasterDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TemplateMasterDetailInstance, TemplateMasterDetailAttributes> {
        return this.Models.TemplateMasterDetail;
    }

}
