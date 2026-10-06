import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceGroupRateMappingInstance, ServiceGroupRateMappingAttributes } from '../Model/Interface/Index';
import { ServiceGroupRateMappingFilters } from '../Common/Filters.e';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';

export class ServiceGroupRateMappingBo extends BaseBo<ServiceGroupRateMappingInstance,
    ServiceGroupRateMappingAttributes> {
    public async AddServiceGroupRateMapping(req: BaseRequest): Promise<any> {
        try {
            this.HandleActiveState(req.Data);
            let result = await this.Save(req.Data);
            return {
                message: 'data saved successfully',
                data: result.dataValues.Id
            };
        } catch (error) {
            return {
                message: error.message,
                data: null
            };
        }
    }
    public async UpdateServiceGroupRateMapping(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetServiceGroupRateMappingById(req: BaseRequest): Promise<ServiceGroupRateMappingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAllServiceGroupRateMapping(apiReq?: ApiRequest<ServiceGroupRateMappingFilters>): Promise<any> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('BedType'));
        include.push(this.GetReference('ActiveStatus'));

        return await this.FindAndCountAll(apiReq, { where: where, include: include });
    }

    public async DeleteServiceGroupRateMapping(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceGroupRateMappingInstance, ServiceGroupRateMappingAttributes> {
        return this.Models.ServiceGroupRateMapping;
    }
}
