import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceRateCategoryInstance, ServiceRateCategoryAttributes } from '../Model/Interface/Index';
import { ServiceRateCategoryFilters } from '../Common/Filters.e';

export class ServiceRateCategoryBo extends BaseBo<ServiceRateCategoryInstance, ServiceRateCategoryAttributes>  {
    public async AddServiceRateCategory(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async AddServiceRateCategoryExcel(req: BaseRequest): Promise<any> {
        let details: ServiceRateCategoryAttributes[] = req.Data || [];
        await Promise.all(details.map(async (DetailItem: ServiceRateCategoryAttributes) => {
            try {
                await this.Save(DetailItem);
            } catch (error) {
                console.error('Error saving detail:', DetailItem, error);
            }
        }));
        return true;
    }
    public async UpdateServiceRateCategory(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetServiceRateCategoryById(req: BaseRequest): Promise<ServiceRateCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceRateCategorys(apiReq?: ApiRequest<ServiceRateCategoryFilters>):
        Promise<ApiResponse<ServiceRateCategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('EncounterType'));
        include.push(this.GetReference('ActiveStatus'));
        // include.push(this.GetReference('GuarantorType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceRateCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceRateCategoryFilters.Name:
                        where['ServiceRateCategory'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ServiceRateCategoryFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ServiceRateCategoryFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ServiceRateCategoryFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    case ServiceRateCategoryFilters.TariffTypeId:
                        where['TariffTypeId'] = param.Value;
                        break;
                    case ServiceRateCategoryFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case ServiceRateCategoryFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceRateCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ServiceRateCategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ServiceRateCategory', 'Text'],
            'ServiceRateCategory', 'Description', 'FacilityId'];
        let val = await this.GetServiceRateCategorys(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ServiceRateCategoryInstance, ServiceRateCategoryAttributes> {
        return this.Models.ServiceRateCategory;
    }

}
