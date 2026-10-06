import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceItemTariffDetailInstance, ServiceItemTariffDetailAttributes } from '../Model/Interface/Index';
import { ServiceItemTariffDetailFilters } from '../Common/Filters.e';

export class ServiceItemTariffDetailBo extends BaseBo<ServiceItemTariffDetailInstance, ServiceItemTariffDetailAttributes> {
    public async AddServiceItemTariffDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceItemTariffDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageSerivceItemTariffDetail(req: BaseRequest): Promise<boolean> {
        let list: ServiceItemTariffDetailAttributes[] = req.Data || [];
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

    public async GetServiceItemTariffDetailById(req: BaseRequest): Promise<ServiceItemTariffDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceItemTariffDetails(apiReq?: ApiRequest<ServiceItemTariffDetailFilters>):
        Promise<ApiResponse<ServiceItemTariffDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.ServiceItem, attributes: ['DepartmentId', 'Name', 'GstId'], required: false,
            include: [
                { model: this.Models.GstMaster,
                    attributes: ['GstId', 'GstName', 'GstPercentage'],
                    required: false }]
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ServiceItemTariffDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ServiceItemTariffDetailFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case ServiceItemTariffDetailFilters.ServiceItemId:
                    where['ServiceItemId'] = param.Value;
                    break;
                case ServiceItemTariffDetailFilters.ServiceRateCategory:
                    where['ServiceRateCategoryId'] = param.Value;
                    break;
                case ServiceItemTariffDetailFilters.EncounterTypeId:
                    where['EncounterTypeId'] = param.Value;
                    break;
                case ServiceItemTariffDetailFilters.FacilityId:
                    where['FacilityId'] = param.Value;
                    break;
                case ServiceItemTariffDetailFilters.TariffTypeId:
                    where['TariffTypeId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceItemTariffDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceItemTariffDetailInstance, ServiceItemTariffDetailAttributes> {
        return this.Models.ServiceItemTariffDetail;
    }

}
