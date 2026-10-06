import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider, } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ExternalProviderInstance, ExternalProviderAttributes } from '../Model/Interface/Index';
import { ExternalProviderFilters } from '../Common/Filters.e';

export class ExternalProviderBo extends BaseBo<ExternalProviderInstance, ExternalProviderAttributes> implements IOptionProvider {
    public async AddExternalProvider(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateExternalProvider(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetExternalProviderById(req: BaseRequest): Promise<ExternalProviderAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetExternalProvideres(apiReq?: ApiRequest<ExternalProviderFilters>): Promise<ApiResponse<ExternalProviderAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ExternalProviderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ExternalProviderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ExternalProviderFilters.TESTMASTERTYPId:
                        where['TESTMASTERTYPId'] = param.Value;
                        break;
                    case ExternalProviderFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ExternalProviderFilters.ProviderName:
                        (where as any)[Op.or] = [{ ProviderName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        // where['ProviderName'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteExternalProvider(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ExternalProviderFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ProviderName', 'Text'], 'ProviderName', 'Description'];
        let val = await this.GetExternalProvideres(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ExternalProviderInstance, ExternalProviderAttributes> {
        return this.Models.ExternalProvider;
    }
}
